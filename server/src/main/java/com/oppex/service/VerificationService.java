package com.oppex.service;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

@ApplicationScoped
public class VerificationService {

    private static final Logger LOG = Logger.getLogger(VerificationService.class);
    private static final Duration CODE_TTL = Duration.ofMinutes(10);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int CODE_LENGTH = 6;

    @Inject
    Mailer mailer;

    @ConfigProperty(name = "app.mailer.from")
    String fromAddress;

    @ConfigProperty(name = "app.mailer.log-code-in-dev", defaultValue = "false")
    boolean logCodeInDev;

    public String generateCode() {
        int code = RANDOM.nextInt((int) Math.pow(10, CODE_LENGTH));
        return String.format("%0" + CODE_LENGTH + "d", code);
    }

    public Instant codeExpiresAt() {
        return Instant.now().plus(CODE_TTL);
    }

    public void sendVerificationCode(String email, String code) {
        LOG.infof("[mail] START — sending verification code to %s from %s", email, fromAddress);

        String textBody =
                """
                Welcome to Oppex!

                Your email verification code is: %s

                This code expires in 10 minutes.
                If you did not sign up, you can ignore this email.
                """
                        .formatted(code);

        try {
            mailer.send(
                    Mail.withText(email, "Oppex verification code", textBody)
                            .setFrom(fromAddress));
            LOG.infof("[mail] COMPLETED — verification code delivered to %s", email);
        } catch (Exception error) {
            LOG.errorf(error, "[mail] FAILED — could not send verification code to %s", email);
            throw error;
        }

        if (logCodeInDev) {
            LOG.warnf(
                    """
                    ===================================================
                    DEV ONLY — verification code for %s: %s
                    ===================================================""",
                    email,
                    code);
        }
    }
}
