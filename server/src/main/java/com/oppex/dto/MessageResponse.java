package com.oppex.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MessageResponse(String message, String devCode) {

    public MessageResponse(String message) {
        this(message, null);
    }
}
