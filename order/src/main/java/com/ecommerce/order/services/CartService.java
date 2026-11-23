package com.ecommerce.order.services;

import com.ecommerce.order.clients.ProductServiceClient;
import com.ecommerce.order.clients.UserServiceClient;
import com.ecommerce.order.dtos.CartItemRequest;
import com.ecommerce.order.dtos.ProductResponse;
import com.ecommerce.order.dtos.UserResponse;
import com.ecommerce.order.models.CartItem;
import com.ecommerce.order.repositories.CartItemRepository;
import io.github.resilience4j.retry.annotation.Retry;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductServiceClient productServiceClient;
    private final UserServiceClient userServiceClient;

    int attempt = 0;

    // @CircuitBreaker(name = "productService", fallbackMethod = "addToCartFallBack")
    @Retry(name = "retryBreaker", fallbackMethod = "addToCartFallBack")
    public boolean addToCart(String userId, CartItemRequest request) {

        System.out.println("ATTEMPT COUNT: " + ++attempt);

        // Look for product
        ProductResponse productResponse =
                productServiceClient.getProductDetails(request.getProductId());

        if (productResponse == null ||
                productResponse.getStockQuantity() < request.getQuantity()) {
            return false;
        }

        UserResponse userResponse =
                userServiceClient.getUserDetails(userId);

        if (userResponse == null) {
            return false;
        }

        CartItem existingCartItem =
                cartItemRepository.findByUserIdAndProductId(
                        userId,
                        request.getProductId()
                );

        if (existingCartItem != null) {

            int newQuantity =
                    existingCartItem.getQuantity() + request.getQuantity();

            if (newQuantity > productResponse.getStockQuantity()) {
                return false;
            }

            existingCartItem.setQuantity(newQuantity);
            existingCartItem.setPrice(productResponse.getPrice());

            cartItemRepository.save(existingCartItem);

        } else {

            // Create new cart item
            CartItem cartItem = new CartItem();

            cartItem.setUserId(userId);
            cartItem.setProductId(request.getProductId());
            cartItem.setQuantity(request.getQuantity());
            cartItem.setPrice(productResponse.getPrice());

            cartItemRepository.save(cartItem);
        }

        return true;
    }

    public boolean addToCartFallBack(
            String userId,
            CartItemRequest request,
            Exception exception) {

        exception.printStackTrace();
        return false;
    }

    public boolean deleteItemFromCart(
            String userId,
            String productId) {

        CartItem cartItem =
                cartItemRepository.findByUserIdAndProductId(
                        userId,
                        productId
                );

        if (cartItem != null) {
            cartItemRepository.delete(cartItem);
            return true;
        }

        return false;
    }

    public boolean updateCartItem(
            String userId,
            String productId,
            int quantity) {

        CartItem cartItem =
                cartItemRepository.findByUserIdAndProductId(
                        userId,
                        productId
                );

        if (cartItem == null) {
            return false;
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return true;
        }

        ProductResponse productResponse =
                productServiceClient.getProductDetails(productId);

        if (productResponse == null ||
                productResponse.getStockQuantity() < quantity) {
            return false;
        }

        cartItem.setQuantity(quantity);
        cartItem.setPrice(productResponse.getPrice());

        cartItemRepository.save(cartItem);

        return true;
    }

    public List<CartItem> getCart(String userId) {
        return cartItemRepository.findByUserId(userId);
    }

    public void clearCart(String userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}