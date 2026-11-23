package com.ecommerce.order.dtos;

import lombok.Data;

@Data
public class CheckoutSessionRequest {
    private String successUrl;
    private String cancelUrl;
}
