package com.oppex.config;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

@ApplicationScoped
public class MailConfigLogger {

    private static final Logger LOG = Logger.getLogger(MailConfigLogger.class);

    @ConfigProperty(name = "quarkus.mailer.host")
    String host;

    @ConfigProperty(name = "quarkus.mailer.port")
    int port;

    @ConfigProperty(name = "quarkus.mailer.username")
    String username;

    @ConfigProperty(name = "app.mailer.from")
    String from;

    void onStart(@Observes StartupEvent event) {
        LOG.infof(
                "Mail config loaded — host=%s port=%d username=%s from=%s",
                host,
                port,
                username,
                from);
    }
}
