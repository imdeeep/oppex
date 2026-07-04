package com.oppex.service;

import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PasswordService {

    public String hash(String plainPassword) {
        return BcryptUtil.bcryptHash(plainPassword);
    }

    public boolean matches(String plainPassword, String passwordHash) {
        return BcryptUtil.matches(plainPassword, passwordHash);
    }
}
