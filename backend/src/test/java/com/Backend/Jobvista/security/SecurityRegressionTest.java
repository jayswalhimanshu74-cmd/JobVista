package com.Backend.Jobvista.security;

import com.Backend.Jobvista.entity.Company;
import com.Backend.Jobvista.entity.EmploymentType;
import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.entity.JobType;
import com.Backend.Jobvista.entity.Role;
import com.Backend.Jobvista.entity.Status;
import com.Backend.Jobvista.entity.User;
import com.Backend.Jobvista.repository.CompanyRepository;
import com.Backend.Jobvista.repository.JobRepository;
import com.Backend.Jobvista.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class SecurityRegressionTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private com.Backend.Jobvista.repository.RecentlyViewedRepository recentlyViewedRepository;

    @Autowired
    private com.Backend.Jobvista.repository.JobApplicationRepository jobApplicationRepository;

    @Autowired
    private com.Backend.Jobvista.repository.SavedJobRepository savedJobRepository;

    private UUID existingJobId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        recentlyViewedRepository.deleteAll();
        jobApplicationRepository.deleteAll();
        savedJobRepository.deleteAll();
        jobRepository.deleteAll();
        companyRepository.deleteAll();

        String uniqueEmail = "compowner_" + UUID.randomUUID() + "@test.com";
        User compUser = User.builder()
                .userId(UUID.randomUUID())
                .name("Regression Company User")
                .email(uniqueEmail)
                .password("password")
                .mobileNumber("1234567890")
                .role(Role.COMPANY)
                .status(Status.ACTIVE)
                .build();
        compUser = userRepository.save(compUser);

        Company company = Company.builder()
                .companyId(UUID.randomUUID())
                .companyName("Regression Corp")
                .companyEmail(uniqueEmail)
                .location("Remote")
                .user(compUser)
                .build();
        company = companyRepository.save(company);

        existingJobId = UUID.randomUUID();
        Job job = Job.builder()
                .jobId(existingJobId)
                .title("Software Engineer")
                .description("Develop full-stack platform features")
                .location("Remote")
                .salaryOrStipend("$120,000")
                .requiredSkills("Java, Spring Boot, React")
                .experienceRequired(3)
                .jobType(JobType.JOB)
                .employmentType(EmploymentType.FULL_TIME)
                .company(company)
                .companyName("Regression Corp")
                .postedAt(LocalDateTime.now())
                .build();
        jobRepository.save(job);
    }

    // ─────────────────────────────────────────────────────────────
    // 1. Admin Endpoints Authorization
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Anonymous users cannot access admin stats (HTTP 401/403)")
    void testAdminStats_Anonymous_Denied() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "candidate@test.com", roles = "USER")
    @DisplayName("Authenticated candidate (ROLE_USER) cannot access admin stats (HTTP 403)")
    void testAdminStats_Candidate_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "employer@test.com", roles = "COMPANY")
    @DisplayName("Authenticated employer (ROLE_COMPANY) cannot access admin stats (HTTP 403)")
    void testAdminStats_Employer_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@jobvista.com", roles = "ADMIN")
    @DisplayName("Administrator (ROLE_ADMIN) retains legitimate access to admin stats (HTTP 200)")
    void testAdminStats_Admin_Permitted() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isOk());
    }

    // ─────────────────────────────────────────────────────────────
    // 2. User Directory Authorization
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Anonymous users cannot access user directory (HTTP 401/403)")
    void testUserDirectory_Anonymous_Denied() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "candidate@test.com", roles = "USER")
    @DisplayName("Candidate cannot access user directory (HTTP 403)")
    void testUserDirectory_Candidate_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "employer@test.com", roles = "COMPANY")
    @DisplayName("Employer cannot access user directory (HTTP 403)")
    void testUserDirectory_Employer_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@jobvista.com", roles = "ADMIN")
    @DisplayName("Administrator can view user directory (HTTP 200)")
    void testUserDirectory_Admin_Permitted() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk());
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Job Details Policy (Public & Cross-Role Access)
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Anonymous users can access public job details (HTTP 200)")
    void testJobDetail_Anonymous_Permitted() throws Exception {
        mockMvc.perform(get("/api/v1/job/" + existingJobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Software Engineer"));
    }

    @Test
    @WithMockUser(username = "candidate@test.com", roles = "USER")
    @DisplayName("Candidates can access job details (HTTP 200)")
    void testJobDetail_Candidate_Permitted() throws Exception {
        mockMvc.perform(get("/api/v1/job/" + existingJobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Software Engineer"));
    }

    @Test
    @WithMockUser(username = "employer@test.com", roles = "COMPANY")
    @DisplayName("Employers can access job details (HTTP 200)")
    void testJobDetail_Employer_Permitted() throws Exception {
        mockMvc.perform(get("/api/v1/job/" + existingJobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Software Engineer"));
    }

    @Test
    @WithMockUser(username = "admin@jobvista.com", roles = "ADMIN")
    @DisplayName("Administrators can access job details (HTTP 200)")
    void testJobDetail_Admin_Permitted() throws Exception {
        mockMvc.perform(get("/api/v1/job/" + existingJobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Software Engineer"));
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Static Uploads Policy (/uploads/** permitAll)
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Static upload resources are publicly permitted by security filter (not blocked with 401/403)")
    void testStaticUploads_PubliclyPermitted() throws Exception {
        // Request passes security filter and reaches resource handler (404 as dummy file does not exist on disk)
        mockMvc.perform(get("/uploads/profiles/non-existent-avatar.png"))
                .andExpect(status().isNotFound());
    }

    // ─────────────────────────────────────────────────────────────
    // 5. Resume Endpoints Role Restrictions
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Anonymous users cannot upload resume (HTTP 401/403)")
    void testResumeUpload_Anonymous_Denied() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", "PDF test content".getBytes());
        mockMvc.perform(multipart("/api/v1/jobSeeker/upload-resume").file(file))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "employer@test.com", roles = "COMPANY")
    @DisplayName("Employer cannot upload resume (restricted to ROLE_USER, HTTP 403)")
    void testResumeUpload_Employer_Forbidden() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", "PDF test content".getBytes());
        mockMvc.perform(multipart("/api/v1/jobSeeker/upload-resume").file(file))
                .andExpect(status().isForbidden());
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        recentlyViewedRepository.deleteAll();
        jobApplicationRepository.deleteAll();
        savedJobRepository.deleteAll();
        jobRepository.deleteAll();
        companyRepository.deleteAll();
    }
}
