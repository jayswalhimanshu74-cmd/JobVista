package com.Backend.Jobvista.config;

import com.Backend.Jobvista.entity.*;
import com.Backend.Jobvista.repository.CompanyRepository;
import com.Backend.Jobvista.repository.JobRepository;
import com.Backend.Jobvista.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    public AdminSeeder(UserRepository userRepository, CompanyRepository companyRepository, JobRepository jobRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedTestUsers();
    }

    private void seedAdmin() {
        String adminEmail = "admin@jobvista.com";
        String adminPassword = System.getenv("ADMIN_PASSWORD");
        if (adminPassword == null || adminPassword.isEmpty()) {
            adminPassword = System.getProperty("ADMIN_PASSWORD", "JobVista6051");
        }

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            User existingAdmin = userRepository.findByEmail(adminEmail).get();
            existingAdmin.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(existingAdmin);
            log.info("Admin password synchronized for {}", adminEmail);
            return;
        }

        User admin = User.builder()
                .userId(UUID.randomUUID())
                .name("Admin")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .mobileNumber("0000000000")
                .role(Role.ADMIN)
                .status(Status.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(admin);
        log.info("✅ Admin user created: {}", adminEmail);
    }

    private void seedTestUsers() {
        try {
            // Seed example@gmail.com as COMPANY (used across test suite)
            String employerEmail = "example@gmail.com";
            User employer = userRepository.findByEmail(employerEmail).orElseGet(() -> {
                User u = User.builder()
                        .userId(UUID.randomUUID())
                        .name("Example Employer")
                        .email(employerEmail)
                        .password(passwordEncoder.encode("password123"))
                        .mobileNumber("9876543210")
                        .role(Role.COMPANY)
                        .status(Status.ACTIVE)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                return userRepository.save(u);
            });
            employer.setPassword(passwordEncoder.encode("password123"));
            employer.setRole(Role.COMPANY);
            userRepository.save(employer);

            Company company = companyRepository.findByUser(employer).orElseGet(() -> {
                Company c = new Company();
                c.setCompanyId(UUID.randomUUID());
                c.setCompanyName("Tech Innovators Inc");
                c.setCompanyEmail(employerEmail);
                c.setLocation("Mumbai, India");
                c.setCompanyWebsite("https://example.com");
                c.setDescription("Leading tech solutions provider.");
                c.setUser(employer);
                return companyRepository.save(c);
            });

            // Ensure at least one active job exists for this company
            if (jobRepository.findByCompany_CompanyId(company.getCompanyId(), org.springframework.data.domain.PageRequest.of(0, 1)).isEmpty()) {
                Job job = Job.builder()
                        .jobId(UUID.randomUUID())
                        .title("Senior Software Engineer")
                        .description("We are looking for a Senior Software Engineer with Java, React, and PostgreSQL experience.")
                        .company(company)
                        .companyName(company.getCompanyName())
                        .location("Mumbai, India")
                        .jobType(JobType.JOB)
                        .employmentType(EmploymentType.FULL_TIME)
                        .salaryOrStipend("15-25 LPA")
                        .requiredSkills("Java, Spring Boot, React, SQL")
                        .experienceRequired(3)
                        .postedAt(LocalDateTime.now())
                        .lastDate(LocalDateTime.now().plusMonths(3))
                        .build();
                jobRepository.save(job);
                log.info("✅ Seeded default job for company {}", company.getCompanyName());
            }

            // Seed candidate.test@example.com as USER
            String candidateEmail = "candidate.test@example.com";
            User candidate = userRepository.findByEmail(candidateEmail).orElseGet(() -> {
                User u = User.builder()
                        .userId(UUID.randomUUID())
                        .name("Test Candidate")
                        .email(candidateEmail)
                        .password(passwordEncoder.encode("password123"))
                        .mobileNumber("5551234567")
                        .role(Role.USER)
                        .status(Status.ACTIVE)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                return userRepository.save(u);
            });
            candidate.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(candidate);

            // Ensure recruiter@example.com has correct password if already present
            String recruiterEmail = "recruiter@example.com";
            userRepository.findByEmail(recruiterEmail).ifPresent(r -> {
                r.setPassword(passwordEncoder.encode("Password123!"));
                r.setRole(Role.COMPANY);
                userRepository.save(r);
            });
        } catch (Exception e) {
            log.warn("Seeding test users encountered non-critical error: {}", e.getMessage());
        }
    }
}