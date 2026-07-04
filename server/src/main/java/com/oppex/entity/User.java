package com.oppex.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, unique = true)
    public String email;

    @Column(name = "password_hash", nullable = false)
    public String passwordHash;

    @Column(name = "is_verified", nullable = false)
    public boolean verified = false;

    @Column(name = "verification_token")
    public String verificationOtp;

    @Column(name = "otp_expires_at")
    public Instant otpExpiresAt;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt = Instant.now();
}
