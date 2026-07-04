package com.oppex.exception;

public class InvalidOtpException extends RuntimeException {

    public InvalidOtpException() {
        super("Invalid verification code");
    }

    public InvalidOtpException(String message) {
        super(message);
    }
}
