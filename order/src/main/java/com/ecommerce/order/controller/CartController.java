package com.ecommerce.order.controller;

import com.ecommerce.order.models.CartItem;
import com.ecommerce.order.dtos.CartItemRequest;
import com.ecommerce.order.services.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<String> addToCart(
            @RequestHeader("X-User-ID") String userId,
            @RequestBody CartItemRequest request) {

        if (!cartService.addToCart(userId, request)) {
            return ResponseEntity
                    .badRequest()
                    .body("Product quantity exceeds available stock.");
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeFromCart(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String productId) {

        boolean deleted =
                cartService.deleteItemFromCart(userId, productId);

        return deleted
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<String> updateCartItem(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String productId,
            @RequestBody CartItemRequest request) {

        boolean updated = cartService.updateCartItem(
                userId,
                productId,
                request.getQuantity()
        );

        if (!updated) {
            return ResponseEntity
                    .badRequest()
                    .body("Requested quantity is not available in stock.");
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(
            @RequestHeader("X-User-ID") String userId) {

        return ResponseEntity.ok(
                cartService.getCart(userId)
        );
    }
}