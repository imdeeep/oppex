package com.oppex.service;

import com.oppex.dto.LoginResponse;
import com.oppex.dto.MessageResponse;
import com.oppex.dto.UserResponse;
import com.oppex.entity.User;
import com.oppex.exception.DuplicateEmailException;
import com.oppex.exception.ExpiredOtpException;
import com.oppex.exception.InvalidCredentialsException;
import com.oppex.exception.InvalidOtpException;
import com.oppex.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.Instant;

@ApplicationScoped
public class UserService {

    private static final String UNVERIFIED_MESSAGE =
            "You need to validate your email to access the portal";
    private static final String VERIFIED_MESSAGE =
            "Your email is validated. You can access the portal";

    @Inject
    UserRepository userRepository;

    @Inject
    PasswordService passwordService;

    @Inject
    VerificationService verificationService;

    @Inject
    DevCodeExposure devCodeExposure;

    @Transactional
    public UserResponse signup(String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException(normalizedEmail);
        }

        String code = verificationService.generateCode();

        User user = new User();
        user.email = normalizedEmail;
        user.passwordHash = passwordService.hash(password);
        user.verificationOtp = code;
        user.otpExpiresAt = verificationService.codeExpiresAt();
        user.verified = false;

        userRepository.persist(user);
        verificationService.sendVerificationCode(user.email, code);

        return new UserResponse(
                user.id, user.email, user.verified, devCodeExposure.maybeExpose(code));
    }

    @Transactional
    public MessageResponse verifyOtp(String email, String otp) {
        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(InvalidOtpException::new);

        if (user.verified) {
            return new MessageResponse("Email is already verified");
        }

        if (user.otpExpiresAt == null || Instant.now().isAfter(user.otpExpiresAt)) {
            throw new ExpiredOtpException();
        }

        String normalizedCode = otp.replaceAll("\\D", "");

        if (user.verificationOtp == null || !user.verificationOtp.equals(normalizedCode)) {
            throw new InvalidOtpException();
        }

        user.verified = true;
        user.verificationOtp = null;
        user.otpExpiresAt = null;

        return new MessageResponse("Email verified successfully");
    }

    @Transactional
    public MessageResponse resendVerificationCode(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() -> new InvalidOtpException("No account found for this email"));

        if (user.verified) {
            return new MessageResponse("Email is already verified");
        }

        String code = verificationService.generateCode();
        user.verificationOtp = code;
        user.otpExpiresAt = verificationService.codeExpiresAt();
        verificationService.sendVerificationCode(user.email, code);

        return new MessageResponse(
                "Verification code sent", devCodeExposure.maybeExpose(code));
    }

    public LoginResponse login(String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordService.matches(password, user.passwordHash)) {
            throw new InvalidCredentialsException();
        }

        String message = user.verified ? VERIFIED_MESSAGE : UNVERIFIED_MESSAGE;
        return new LoginResponse(user.id, user.email, user.verified, message);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(user.id, user.email, user.verified);
    }
}
