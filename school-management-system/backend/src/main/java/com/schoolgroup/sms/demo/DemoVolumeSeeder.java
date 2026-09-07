package com.schoolgroup.sms.demo;

import com.schoolgroup.sms.config.AppProperties;
import com.schoolgroup.sms.entity.Branch;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.service.DevDataSeeder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DEMO ONLY. Creates 8 × 530 fictional students when app.seed.volume=true.
 * Disabled in test/prod. Safe to delete this class to remove volume seeding.
 */
@Component
@Order(2)
public class DemoVolumeSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoVolumeSeeder.class);

    private final AppProperties properties;
    private final PasswordEncoder encoder;
    private final BranchRepository branches;
    private final StudentRepository students;
    private final DemoVolumeSeedService seedService;

    public DemoVolumeSeeder(AppProperties properties, PasswordEncoder encoder, BranchRepository branches,
                            StudentRepository students, DemoVolumeSeedService seedService) {
        this.properties = properties;
        this.encoder = encoder;
        this.branches = branches;
        this.students = students;
        this.seedService = seedService;
    }

    @Override
    public void run(String... args) {
        if (!properties.getSeed().isVolume()) {
            return;
        }
        if (students.count() >= 8L * DemoCampuses.STUDENTS_PER_BRANCH) {
            log.info("Demo volume already present ({} students). Skipping.", students.count());
            return;
        }
        log.warn("Seeding DEMO volume data (fictional Delhi NCR campuses). Not for production.");
        String passwordHash = encoder.encode(DevDataSeeder.DEV_PASSWORD);
        int created = 0;
        for (Branch branch : branches.findAll()) {
            created += seedService.seedBranch(branch.getId(), passwordHash);
        }
        log.warn("Demo volume complete. Students now: {}. Created this run: {}.", students.count(), created);
    }
}
