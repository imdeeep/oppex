package com.oppex.dto;

public record LoginResponse(Long id, String email, boolean verified, String message) {
}
