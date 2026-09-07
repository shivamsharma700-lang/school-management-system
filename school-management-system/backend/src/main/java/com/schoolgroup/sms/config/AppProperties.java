package com.schoolgroup.sms.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Files files = new Files();
    private final Payment payment = new Payment();
    private final Seed seed = new Seed();

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
}
