package com.ecommerce.order.services;

import com.ecommerce.order.clients.ProductServiceClient;
import com.ecommerce.order.clients.UserServiceClient;
import com.ecommerce.order.dtos.CheckoutSessionRequest;
import com.ecommerce.order.dtos.CheckoutSessionResponse;
import com.ecommerce.order.dtos.OrderResponse;
import com.ecommerce.order.dtos.ProductResponse;
import com.ecommerce.order.dtos.UserResponse;
import com.ecommerce.order.models.CartItem;
import com.ecommerce.order.models.Order;
import com.ecommerce.order.models.OrderItem;
import com.ecommerce.order.models.OrderStatus;
import com.ecommerce.order.repositories.OrderRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeService {

    private final CartService cartService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final ProductServiceClient productServiceClient;
    private final UserServiceClient userServiceClient;
    private final ObjectMapper objectMapper;

    @Value("${stripe.api-key:}")
    private String apiKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${stripe.currency:inr}")
    private String defaultCurrency;

    @Value("${stripe.success-url:http://localhost:5173/order-confirmation?session_id={CHECKOUT_SESSION_ID}}")
    private String defaultSuccessUrl;

    @Value("${stripe.cancel-url:http://localhost:5173/cart?payment_status=cancelled}")
    private String defaultCancelUrl;

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isBlank()) {
            Stripe.apiKey = apiKey;
            log.info("Stripe initialized with configured API key.");
        } else {
            log.warn("Stripe API key is not configured. Set STRIPE_SECRET_KEY to enable live checkout.");
        }
    }

    private void ensureApiKeyConfigured() {
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("placeholder")) {
            throw new IllegalStateException("Stripe Secret Key is not configured. Please set the STRIPE_SECRET_KEY environment variable.");
        }
        Stripe.apiKey = apiKey;
    }

    @Transactional
    public CheckoutSessionResponse createCheckoutSession(String userId, CheckoutSessionRequest request) throws StripeException {
        ensureApiKeyConfigured();

        List<CartItem> cartItems = cartService.getCart(userId);
        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty for user: " + userId);
        }

        BigDecimal totalPrice = cartItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create pending order
        Order order = new Order();
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus("PENDING");
        order.setPaymentMethod("STRIPE");
        order.setTotalAmount(totalPrice);

 List<OrderItem> orderItems = new ArrayList<>(
        cartItems.stream()
                .map(item -> new OrderItem(
                        null,
                        item.getProductId(),
                        item.getQuantity(),
                        item.getPrice(),
                        order
                ))
                .toList()
);
        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        // Fetch user info for prefilled customer email
        String customerEmail = null;
        try {
            UserResponse user = userServiceClient.getUserDetails(userId);
            if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
                customerEmail = user.getEmail();
            }
        } catch (Exception e) {
            log.warn("Could not retrieve user details for userId: {}, proceeding without email: {}", userId, e.getMessage());
        }

        String currency = (defaultCurrency != null && !defaultCurrency.isBlank()) ? defaultCurrency.toLowerCase() : "inr";
        String successUrl = (request != null && request.getSuccessUrl() != null && !request.getSuccessUrl().isBlank())
                ? request.getSuccessUrl()
                : defaultSuccessUrl;
        String cancelUrl = (request != null && request.getCancelUrl() != null && !request.getCancelUrl().isBlank())
                ? request.getCancelUrl()
                : defaultCancelUrl;

        // Build Stripe line items
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();
        for (CartItem item : cartItems) {
            String productName = "Product #" + item.getProductId();
            String productDesc = null;
            String imageUrl = null;

            try {
                ProductResponse product = productServiceClient.getProductDetails(item.getProductId());
                if (product != null) {
                    if (product.getName() != null && !product.getName().isBlank()) {
                        productName = product.getName();
                    }
                    productDesc = product.getDescription();
                    if (product.getImageUrl() != null && product.getImageUrl().startsWith("http")) {
                        imageUrl = product.getImageUrl();
                    }
                }
            } catch (Exception e) {
                log.warn("Could not fetch product details for productId: {}", item.getProductId());
            }

            SessionCreateParams.LineItem.PriceData.ProductData.Builder productDataBuilder =
                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName(productName);

            if (productDesc != null && !productDesc.isBlank()) {
                productDataBuilder.setDescription(productDesc);
            }
            if (imageUrl != null && !imageUrl.isBlank()) {
                productDataBuilder.addImage(imageUrl);
            }

            // Price in smallest currency unit (cents / paise)
            long unitAmount = item.getPrice().multiply(BigDecimal.valueOf(100)).longValue();

            SessionCreateParams.LineItem.PriceData priceData =
                    SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency(currency)
                            .setUnitAmount(unitAmount)
                            .setProductData(productDataBuilder.build())
                            .build();

            SessionCreateParams.LineItem lineItem =
                    SessionCreateParams.LineItem.builder()
                            .setQuantity((long) item.getQuantity())
                            .setPriceData(priceData)
                            .build();

            lineItems.add(lineItem);
        }

        SessionCreateParams.Builder sessionParamsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .setClientReferenceId(savedOrder.getId().toString())
                .putMetadata("orderId", savedOrder.getId().toString())
                .putMetadata("userId", userId)
                .addAllLineItem(lineItems);

        if (customerEmail != null) {
            sessionParamsBuilder.setCustomerEmail(customerEmail);
        }

        Session session = Session.create(sessionParamsBuilder.build());

        savedOrder.setStripeSessionId(session.getId());
        orderRepository.save(savedOrder);

        log.info("Stripe checkout session created: {} for order: {}", session.getId(), savedOrder.getId());

        return new CheckoutSessionResponse(session.getUrl(), session.getId(), savedOrder.getId());
    }

    @Transactional
    public OrderResponse confirmPayment(String sessionId) throws StripeException {
        ensureApiKeyConfigured();

        Session session = Session.retrieve(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Stripe session not found: " + sessionId);
        }

        String paymentStatus = session.getPaymentStatus();
        log.info("Confirming session: {}, payment_status: {}", sessionId, paymentStatus);

        Order order = orderRepository.findByStripeSessionId(sessionId)
                .or(() -> {
                    String orderIdStr = session.getMetadata() != null ? session.getMetadata().get("orderId") : null;
                    if (orderIdStr != null) {
                        try {
                            return orderRepository.findById(Long.parseLong(orderIdStr));
                        } catch (NumberFormatException ignored) {}
                    }
                    return Optional.empty();
                })
                .orElseThrow(() -> new IllegalArgumentException("Order not found for Stripe session: " + sessionId));

        if ("paid".equalsIgnoreCase(paymentStatus)) {
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CONFIRMED);
                order.setPaymentStatus("PAID");
                order.setStripePaymentIntentId(session.getPaymentIntent());
                Order savedOrder = orderRepository.save(order);

                // Clear user cart
                cartService.clearCart(savedOrder.getUserId());

                // Publish Kafka / Stream event
                orderService.publishOrderCreatedEvent(savedOrder);

                log.info("Order {} confirmed and cart cleared for user {}", savedOrder.getId(), savedOrder.getUserId());
                return orderService.mapToOrderResponse(savedOrder);
            }
        } else {
            log.warn("Payment not paid for session {}, status is {}", sessionId, paymentStatus);
        }

        return orderService.mapToOrderResponse(order);
    }


    @Transactional
    public boolean handleWebhook(String payload, String sigHeader) {

        // Step 1: Check whether the webhook secret is configured.
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.error("Stripe webhook secret is not configured");
            return false;
        }

        // Step 2: Check whether Stripe signature is present.
        if (sigHeader == null || sigHeader.isBlank()) {
            log.error("Stripe webhook signature is missing");
            return false;
        }

        Event event;

        // Step 3: Verify the Stripe webhook signature.
        try {
            event = Webhook.constructEvent(
                    payload,
                    sigHeader,
                    webhookSecret
            );

        } catch (Exception e) {
            log.error(
                    "Stripe webhook signature verification failed: {}",
                    e.getMessage()
            );
            return false;
        }

        log.info(
                "Received verified Stripe webhook event: {}",
                event.getType()
        );

        // Step 4: Process successful Checkout Session events.
        if ("checkout.session.completed".equals(event.getType())) {

            EventDataObjectDeserializer deserializer =
                    event.getDataObjectDeserializer();

            Optional<StripeObject> stripeObject =
                    deserializer.getObject();

            if (stripeObject.isEmpty()
                    || !(stripeObject.get() instanceof Session session)) {

                log.error("Unable to deserialize Stripe Checkout Session");
                return false;
            }

            // Step 5: Confirm payment using Stripe's API.
            try {
                confirmPayment(session.getId());

                log.info(
                        "Successfully processed Stripe webhook for session: {}",
                        session.getId()
                );

                return true;

            } catch (Exception e) {

                log.error(
                        "Failed to confirm order from Stripe webhook: {}",
                        e.getMessage(),
                        e
                );

                return false;
            }
        }

        // Step 6: Other verified events are acknowledged.
        log.info(
                "No processing required for Stripe event: {}",
                event.getType()
        );

        return true;
    }

}
