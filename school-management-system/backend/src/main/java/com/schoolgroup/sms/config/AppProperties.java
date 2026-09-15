package com.schoolgroup.sms.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Files files = new Files();
    private final Payment payment = new Payment();
    private final Seed seed = new Seed();
    private final Bootstrap bootstrap = new Bootstrap();

    public Jwt getJwt() {
        return jwt;
    }

    public Cors getCors() {
        return cors;
    }

    public Files getFiles() {
        return files;
    }

    public Payment getPayment() {
        return payment;
    }

    public Seed getSeed() {
        return seed;
    }

    public Bootstrap getBootstrap() {
        return bootstrap;
    }

    public static class Jwt {
        private String secret;
        private long accessMinutes = 20;
        private long refreshDays = 7;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getAccessMinutes() {
            return accessMinutes;
        }

        public void setAccessMinutes(long accessMinutes) {
            this.accessMinutes = accessMinutes;
        }

        public long getRefreshDays() {
            return refreshDays;
        }

        public void setRefreshDays(long refreshDays) {
            this.refreshDays = refreshDays;
        }
    }

    public static class Cors {
        private String origins = "http://localhost:5173";

        public String getOrigins() {
            return origins;
        }

        public void setOrigins(String origins) {
            this.origins = origins;
        }
    }

    public static class Files {
        private String storageDir = "./data/uploads";
        private int maxSizeMb = 10;

        public String getStorageDir() {
            return storageDir;
        }

        public void setStorageDir(String storageDir) {
            this.storageDir = storageDir;
        }

        public int getMaxSizeMb() {
            return maxSizeMb;
        }

        public void setMaxSizeMb(int maxSizeMb) {
            this.maxSizeMb = maxSizeMb;
        }
    }

    public static class Payment {
        private String secret;
        private String provider = "mock";

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }
    }

    public static class Seed {
        private boolean enabled = false;
        private boolean volume = false;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public boolean isVolume() {
            return volume;
        }

        public void setVolume(boolean volume) {
            this.volume = volume;
        }
    }

    /** One-time first SUPER_ADMIN when the users table is empty. Off by default. */
    public static class Bootstrap {
        private boolean enabled = false;
        private String email;
        private String username;
        private String password;
        private String fullName = "Super Admin";

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
    }
}
