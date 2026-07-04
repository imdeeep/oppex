package com.oppex.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

@QuarkusTest
class PasswordServiceTest {

    @Inject
    PasswordService passwordService;

    @Test
    void hashProducesDifferentValueThanPlainText() {
        String plain = "SecurePass1";
        String hash = passwordService.hash(plain);

        assertNotEquals(plain, hash);
    }

    @Test
    void matchesReturnsTrueForCorrectPassword() {
        String plain = "SecurePass1";
        String hash = passwordService.hash(plain);

        assertTrue(passwordService.matches(plain, hash));
    }

    @Test
    void matchesReturnsFalseForWrongPassword() {
        String hash = passwordService.hash("SecurePass1");

        assertFalse(passwordService.matches("WrongPass1", hash));
    }
}
