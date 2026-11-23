package com.ecommerce.order.dtos;

import com.ecommerce.order.models.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;
    private String paymentStatus;
    private String paymentMethod;
    private String stripeSessionId;

    public OrderResponse(Long id, BigDecimal totalAmount, OrderStatus status, List<OrderItemDTO> items, LocalDateTime createdAt) {
        this.id = id;
        this.totalAmount = totalAmount;
        this.status = status;
        this.items = items;
        this.createdAt = createdAt;
    }
}
