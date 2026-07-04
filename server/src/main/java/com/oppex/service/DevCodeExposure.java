package com.oppex.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class DevCodeExposure {

    @ConfigProperty(name = "app.mailer.log-code-in-dev", defaultValue = "false")
    boolean enabled;

    public String maybeExpose(String code) {
        return enabled ? code : null;
    }
}
