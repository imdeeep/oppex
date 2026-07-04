package com.oppex.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.oppex.dto.UserResponse;
import com.oppex.entity.User;
import com.oppex.exception.DuplicateEmailException;
import com.oppex.exception.InvalidCredentialsException;
import com.oppex.repository.UserRepository;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@QuarkusTest
class UserServiceTest {

    @Inject
    UserService userService;

    @InjectMock
    UserRepository userRepository;

    @InjectMock
    VerificationService verificationService;

    @BeforeEach
    void setUp() {
        when(verificationService.generateCode()).thenReturn("123456");
        when(verificationService.codeExpiresAt()).thenReturn(Instant.now().plusSeconds(600));
    }

    @Test
    void signupThrowsWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(
                DuplicateEmailException.class,
                () -> userService.signup("test@example.com", "SecurePass1"));

        verify(userRepository, never()).persist(any(User.class));
    }

    @Test
    void loginThrowsWhenPasswordIsWrong() {
        User user = new User();
        user.id = 1L;
        user.email = "test@example.com";
        user.passwordHash = new PasswordService().hash("SecurePass1");
        user.verified = false;

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThrows(
                InvalidCredentialsException.class,
                () -> userService.login("test@example.com", "WrongPass1"));
    }

    @Test
    void signupCreatesUser() {
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);

        UserResponse response = userService.signup("new@example.com", "SecurePass1");

        assertEquals("new@example.com", response.email());
        assertEquals(false, response.verified());
        verify(userRepository).persist(any(User.class));
        verify(verificationService).sendVerificationCode("new@example.com", "123456");
    }
}
