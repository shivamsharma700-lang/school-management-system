package com.schoolgroup.sms.demo;

import com.schoolgroup.sms.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * DEMO ONLY. Adds recent attendance, exams, transport, library and leave
 * after volume students exist. Safe to delete with the rest of the demo package.
 */
@Component
@Order(3)
public class DemoCampusEnricher implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoCampusEnricher.class);

    private final AppProperties properties;
    private final DemoEnrichmentService enrichment;

    public DemoCampusEnricher(AppProperties properties, DemoEnrichmentService enrichment) {
        this.properties = properties;
        this.enrichment = enrichment;
    }

    @Override
    public void run(String... args) {
        if (!properties.getSeed().isVolume()) {
            return;
        }
        log.warn("Enriching DEMO campus records (attendance, exams, transport, library, leave).");
        enrichment.enrichAll();
    }
}
