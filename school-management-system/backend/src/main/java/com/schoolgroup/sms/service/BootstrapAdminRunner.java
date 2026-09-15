package com.schoolgroup.sms.service;

import com.schoolgroup.sms.config.AppProperties;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the first SUPER_ADMIN when the database has no users.
 * Enable only for initial pilot bootstrap, then disable and restart.
 */
@Component
@Order(0)
public class BootstrapAdminRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(BootstrapAdminRunner.class);

    private final AppProperties properties;
    private final UserAccountRepository users;
    private final PasswordEncoder encoder;

    public BootstrapAdminRunner(AppProperties properties, UserAccountRepository users, PasswordEncoder encoder) {
        this.properties = properties;
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        AppProperties.Bootstrap boot = properties.getBootstrap();
        if (!boot.isEnabled()) {
            return;
        }
        if (users.count() > 0) {
            log.info("Bootstrap admin skipped: users already exist. Disable app.bootstrap.enabled.");
            return;
        }
        if (isBlank(boot.getEmail()) || isBlank(boot.getUsername()) || isBlank(boot.getPassword())) {
            throw new IllegalStateException(
                    "Bootstrap enabled but BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_USERNAME, and BOOTSTRAP_ADMIN_PASSWORD are required");
        }
        if (boot.getPassword().length() < 12) {
            throw new IllegalStateException("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters");
        }
        UserAccount admin = new UserAccount();
        admin.setEmail(boot.getEmail().trim().toLowerCase());
        admin.setUsername(boot.getUsername().trim());
        admin.setPasswordHash(encoder.encode(boot.getPassword()));
        admin.setFullName(isBlank(boot.getFullName()) ? "Super Admin" : boot.getFullName().trim());
        admin.setRole(Role.SUPER_ADMIN);
        admin.setStatus("ACTIVE");
        users.save(admin);
        log.warn("Bootstrap SUPER_ADMIN created ({}). Disable app.bootstrap.enabled and restart.", admin.getEmail());
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
