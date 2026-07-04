package com.oppex.exception;

public class ExpiredOtpException extends RuntimeException {

    public ExpiredOtpException() {
        super("Verification code has expired. Please sign up again or request a new code.");
    }
}
