package com.ecommerce.order.controller;

import com.ecommerce.order.dtos.CheckoutSessionRequest;
import com.ecommerce.order.dtos.CheckoutSessionResponse;
import com.ecommerce.order.dtos.OrderResponse;
import com.ecommerce.order.services.OrderService;
import com.ecommerce.order.services.StripeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final StripeService stripeService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader("X-User-ID") String userId) {

        return orderService.createOrder(userId)
                .map(orderResponse ->
                        new ResponseEntity<>(orderResponse, HttpStatus.CREATED))
                .orElseGet(() ->
                        ResponseEntity.badRequest().build());
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckoutSession(
            @RequestHeader("X-User-ID") String userId,
            @RequestBody(required = false) CheckoutSessionRequest request) {

        try {
            CheckoutSessionResponse response =
                    stripeService.createCheckoutSession(userId, request);

            return ResponseEntity.ok(response);

        } catch (IllegalStateException | IllegalArgumentException e) {

            String message = e.getMessage() != null
                    ? e.getMessage()
                    : "Invalid checkout request";

            return ResponseEntity.badRequest()
                    .body(Map.of("message", message));

        } catch (Exception e) {

            String message = e.getMessage() != null
                    ? e.getMessage()
                    : "Internal server error while creating checkout session";

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", message));
        }
    }

    @GetMapping("/confirm-payment")
    public ResponseEntity<?> confirmPayment(
            @RequestParam("sessionId") String sessionId) {

        try {
            OrderResponse response =
                    stripeService.confirmPayment(sessionId);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            String message = e.getMessage() != null
                    ? e.getMessage()
                    : "Invalid session ID";

            return ResponseEntity.badRequest()
                    .body(Map.of("message", message));

        } catch (Exception e) {

            String message = e.getMessage() != null
                    ? e.getMessage()
                    : "Internal server error while confirming payment";

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", message));
        }
    }

    @GetMapping("/by-session")
    public ResponseEntity<?> getOrderBySession(
            @RequestParam("sessionId") String sessionId,
            @RequestHeader("X-User-ID") String userId) {

        Optional<OrderResponse> order =
                orderService.getOrderByStripeSessionId(sessionId, userId);

        if (order.isPresent()) {
            return ResponseEntity.ok(order.get());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "message",
                        "Order not found for session: " + sessionId
                ));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false)
            String sigHeader) {

        boolean processed =
                stripeService.handleWebhook(payload, sigHeader);

        if (processed) {
            return ResponseEntity.ok("Received");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Webhook signature verification failed");
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(
            @RequestHeader("X-User-ID") String userId) {

        return ResponseEntity.ok(
                orderService.getOrdersByUserId(userId)
        );
    }
}