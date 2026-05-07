package com.Backend.Jobvista.config;

import com.Backend.Jobvista.entity.*;
import com.Backend.Jobvista.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedData();
        }
    }

    private void seedData() {
        // 1. Create ADMIN
        User admin = User.builder()
                .name("Admin User")
                .email("admin@jobvista.com")
                .password(passwordEncoder.encode("admin123"))
                .mobileNumber("1234567890")
                .role(Role.ADMIN)
                .status(Status.ACTIVE)
                .userId(UUID.randomUUID())
                .build();
        userRepository.save(admin);

        // 2. Create Company User & Profile
        User companyUser = User.builder()
                .name("Tech Corp HR")
                .email("hr@techcorp.com")
                .password(passwordEncoder.encode("company123"))
                .mobileNumber("9876543210")
                .role(Role.COMPANY)
                .status(Status.ACTIVE)
                .userId(UUID.randomUUID())
                .build();
        userRepository.save(companyUser);

        Company techCorp = Company.builder()
                .companyName("Tech Corp")
                .companyEmail("contact@techcorp.com")
                .companyWebsite("https://techcorp.com")
                .location("Bangalore, India")
                .description("A leading technology company specializing in AI and Cloud Computing.")
                .user(companyUser)
                .companyId(UUID.randomUUID())
                .build();
        companyRepository.save(techCorp);

        // 3. Create some Jobs
        Job job1 = Job.builder()
                .title("Senior Java Developer")
                .description("We are looking for an experienced Java Developer to join our core team.")
                .jobType(JobType.JOB)
                .employmentType(EmploymentType.FULL_TIME)
                .location("Remote")
                .salaryOrStipend("25 LPA - 35 LPA")
                .requiredSkills("Java, Spring Boot, Microservices, AWS")
                .experienceRequired(5)
                .company(techCorp)
                .companyName(techCorp.getCompanyName())
                .postedAt(LocalDateTime.now())
                .jobId(UUID.randomUUID())
                .build();

        Job job2 = Job.builder()
                .title("Frontend Intern (React)")
                .description("Great opportunity for students to learn modern web development with React.")
                .jobType(JobType.INTERNSHIP)
                .employmentType(EmploymentType.PART_TIME)
                .location("Bangalore")
                .salaryOrStipend("25,000 / month")
                .requiredSkills("React, JavaScript, CSS, Tailwind")
                .experienceRequired(0)
                .company(techCorp)
                .companyName(techCorp.getCompanyName())
                .postedAt(LocalDateTime.now())
                .jobId(UUID.randomUUID())
                .build();

        jobRepository.saveAll(List.of(job1, job2));

        // 4. Create a regular User (Job Seeker)
        User seeker = User.builder()
                .name("John Doe")
                .email("john@gmail.com")
                .password(passwordEncoder.encode("user1234"))
                .mobileNumber("1122334455")
                .role(Role.USER)
                .status(Status.ACTIVE)
                .userId(UUID.randomUUID())
                .build();
        userRepository.save(seeker);

        System.out.println("✅ Database seeded successfully with default data!");
    }
}
