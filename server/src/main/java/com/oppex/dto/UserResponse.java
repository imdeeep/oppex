package com.oppex.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserResponse(Long id, String email, boolean verified, String devCode) {

    public UserResponse(Long id, String email, boolean verified) {
        this(id, email, verified, null);
    }
}
