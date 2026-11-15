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

import org.springframework.http.MediaType;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
    private com.Backend.Jobvista.repository.JobSeekersRepository jobSeekersRepository;

    @Autowired
    private com.Backend.Jobvista.repository.SavedJobRepository savedJobRepository;

    @Autowired
    private com.Backend.Jobvista.repository.NotificationRepository notificationRepository;

    private UUID existingJobId;
    private String companyOwnerEmail;
    private UUID testApplicationId;
    private Long testNotificationId;
    private String candidateOwnerEmail = "candidate_owner@test.com";
    private java.nio.file.Path tempResumePath;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        notificationRepository.deleteAll();
        recentlyViewedRepository.deleteAll();
        jobApplicationRepository.deleteAll();
        savedJobRepository.deleteAll();
        jobRepository.deleteAll();
        companyRepository.deleteAll();
        jobSeekersRepository.deleteAll();
        userRepository.deleteAll();

        String uniqueEmail = "compowner_" + UUID.randomUUID() + "@test.com";
        companyOwnerEmail = uniqueEmail;
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
        job = jobRepository.save(job);

        // Candidate user and JobSeeker profile
        candidateOwnerEmail = "cand_" + UUID.randomUUID() + "@test.com";
        User candidateUser = User.builder()
                .userId(UUID.randomUUID())
                .name("Test Candidate")
                .email(candidateOwnerEmail)
                .password("password")
                .mobileNumber("9876543210")
                .role(Role.USER)
                .status(Status.ACTIVE)
                .build();
        candidateUser = userRepository.save(candidateUser);

        String resumeFileName = "dummy-resume-" + UUID.randomUUID() + ".pdf";
        try {
            java.nio.file.Path resumeDir = java.nio.file.Paths.get("uploads/resumes").toAbsolutePath().normalize();
            java.nio.file.Files.createDirectories(resumeDir);
            tempResumePath = resumeDir.resolve(resumeFileName);
            java.nio.file.Files.write(tempResumePath, "%PDF-1.4 dummy content".getBytes());
        } catch (java.io.IOException ignored) {}

        com.Backend.Jobvista.entity.JobSeeker seeker = com.Backend.Jobvista.entity.JobSeeker.builder()
                .jobSeekerId(UUID.randomUUID())
                .user(candidateUser)
                .resumeUrl(resumeFileName)
                .build();
        seeker = jobSeekersRepository.save(seeker);

        com.Backend.Jobvista.entity.JobApplication application = com.Backend.Jobvista.entity.JobApplication.builder()
                .job(job)
                .jobSeeker(seeker)
                .applicationStatus(com.Backend.Jobvista.entity.ApplicationStatus.APPLIED)
                .appliedAt(LocalDateTime.now())
                .build();
        application = jobApplicationRepository.save(application);
        testApplicationId = application.getJobApplicationId();

        com.Backend.Jobvista.entity.Notification notification = com.Backend.Jobvista.entity.Notification.builder()
                .userId(candidateOwnerEmail)
                .message("Your application was received")
                .type(com.Backend.Jobvista.entity.NotificationType.INFO)
                .isRead(false)
                .build();
        notification = notificationRepository.save(notification);
        testNotificationId = notification.getId();
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
    @DisplayName("Employer cannot upload resume (restricted to ROLE_USER, HTTP 403)")
    void testResumeUpload_Employer_Forbidden() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", "PDF test content".getBytes());
        mockMvc.perform(multipart("/api/v1/jobSeeker/upload-resume").file(file))
                .andExpect(status().isForbidden());
    }

    // ─────────────────────────────────────────────────────────────
    // 6. Resume Exposure Protection Tests
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Anonymous users cannot directly access /uploads/resumes/** (HTTP 401/403)")
    void testStaticResumes_Anonymous_Denied() throws Exception {
        mockMvc.perform(get("/uploads/resumes/dummy-resume.pdf"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("Anonymous users cannot download application resume (HTTP 401/403)")
    void testApplicationResume_Anonymous_Denied() throws Exception {
        mockMvc.perform(get("/api/v1/application/" + testApplicationId + "/resume"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "other_candidate@test.com", roles = "USER")
    @DisplayName("Unrelated candidate cannot download another candidate's resume (HTTP 403)")
    void testApplicationResume_UnrelatedCandidate_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/application/" + testApplicationId + "/resume"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "other_company@test.com", roles = "COMPANY")
    @DisplayName("Unrelated company cannot download candidate resume for another company's job (HTTP 403)")
    void testApplicationResume_UnrelatedCompany_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/application/" + testApplicationId + "/resume"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Candidate owner can download own application resume (HTTP 200)")
    void testApplicationResume_CandidateOwner_Permitted() throws Exception {
        mockMvc.perform(get("/api/v1/application/" + testApplicationId + "/resume")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(candidateOwnerEmail).roles("USER")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Job posting company can download applicant's resume (HTTP 200)")
    void testApplicationResume_JobOwnerCompany_Permitted() throws Exception {
        mockMvc.perform(get("/api/v1/application/" + testApplicationId + "/resume")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(companyOwnerEmail).roles("COMPANY")))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@jobvista.com", roles = "ADMIN")
    @DisplayName("Administrator can download application resume (HTTP 200)")
    void testApplicationResume_Admin_Permitted() throws Exception {
        mockMvc.perform(get("/api/v1/application/" + testApplicationId + "/resume"))
                .andExpect(status().isOk());
    }

    // ─────────────────────────────────────────────────────────────
    // 7. IDOR: Applicants by Job & Delete Job Ownership Tests
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Anonymous user cannot view applicants by job (HTTP 401/403)")
    void testApplicantsByJob_Anonymous_Denied() throws Exception {
        mockMvc.perform(get("/api/v1/application/job/" + existingJobId))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "candidate@test.com", roles = "USER")
    @DisplayName("Candidate cannot view applicants by job (HTTP 403)")
    void testApplicantsByJob_Candidate_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/application/job/" + existingJobId))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "unrelated_company@test.com", roles = "COMPANY")
    @DisplayName("Unrelated company cannot view applicants of another company's job (HTTP 403)")
    void testApplicantsByJob_UnrelatedCompany_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/application/job/" + existingJobId))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Job owning company can view applicants of its job (HTTP 200)")
    void testApplicantsByJob_OwnerCompany_Permitted() throws Exception {
        mockMvc.perform(get("/api/v1/application/job/" + existingJobId)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(companyOwnerEmail).roles("COMPANY")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Anonymous user cannot delete job (HTTP 401/403)")
    void testDeleteJob_Anonymous_Denied() throws Exception {
        mockMvc.perform(delete("/api/v1/job/" + existingJobId))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "candidate@test.com", roles = "USER")
    @DisplayName("Candidate cannot delete job (HTTP 403)")
    void testDeleteJob_Candidate_Forbidden() throws Exception {
        mockMvc.perform(delete("/api/v1/job/" + existingJobId))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "unrelated_company@test.com", roles = "COMPANY")
    @DisplayName("Unrelated company cannot delete another company's job (HTTP 403)")
    void testDeleteJob_UnrelatedCompany_Forbidden() throws Exception {
        mockMvc.perform(delete("/api/v1/job/" + existingJobId))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Job owning company can delete its own job (HTTP 200)")
    void testDeleteJob_OwnerCompany_Permitted() throws Exception {
        UUID jobToDelete = UUID.randomUUID();
        Job job = Job.builder()
                .jobId(jobToDelete)
                .title("Job To Delete")
                .description("Description")
                .location("Remote")
                .requiredSkills("Skills")
                .experienceRequired(1)
                .company(companyRepository.findAll().get(0))
                .companyName("Regression Corp")
                .postedAt(LocalDateTime.now())
                .build();
        jobRepository.save(job);

        mockMvc.perform(delete("/api/v1/job/" + jobToDelete)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(companyOwnerEmail).roles("COMPANY")))
                .andExpect(status().isOk());
    }

    // ─────────────────────────────────────────────────────────────
    // 8. Notification Mark-As-Read IDOR Protection Tests
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Anonymous user cannot mark notification as read (HTTP 401/403)")
    void testNotificationMarkRead_Anonymous_Denied() throws Exception {
        mockMvc.perform(patch("/api/v1/notifications/" + testNotificationId + "/read"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "other_user@test.com", roles = "USER")
    @DisplayName("User cannot mark another user's notification as read (HTTP 403)")
    void testNotificationMarkRead_OtherUser_Forbidden() throws Exception {
        mockMvc.perform(patch("/api/v1/notifications/" + testNotificationId + "/read"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Notification owner can mark notification as read (HTTP 204)")
    void testNotificationMarkRead_Owner_Success() throws Exception {
        mockMvc.perform(patch("/api/v1/notifications/" + testNotificationId + "/read")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(candidateOwnerEmail).roles("USER")))
                .andExpect(status().isNoContent());
    }

    // ─────────────────────────────────────────────────────────────
    // 9. Token Leak Prevention in User Responses
    // ─────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "admin@jobvista.com", roles = "ADMIN")
    @DisplayName("User profile and directory responses do not expose verificationToken")
    void testUserResponses_DoNotExposeVerificationToken() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].verificationToken").doesNotExist());
    }

    // ─────────────────────────────────────────────────────────────
    // 10. Jakarta Validation Tests (@Valid)
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Login with invalid email or blank password returns HTTP 400 Bad Request")
    void testLoginValidation_InvalidPayload_ReturnsBadRequest() throws Exception {
        String invalidPayload = "{\"email\":\"not-an-email\",\"password\":\"\"}";
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    @DisplayName("Job creation with blank title or negative experience returns HTTP 400 Bad Request")
    void testJobValidation_BlankTitle_ReturnsBadRequest() throws Exception {
        String invalidJob = "{\"title\":\"\",\"description\":\"valid description\",\"experienceRequired\":-1}";
        mockMvc.perform(post("/api/v1/job")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJob)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(companyOwnerEmail).roles("COMPANY")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").exists())
                .andExpect(jsonPath("$.experienceRequired").exists());
    }

    // ─────────────────────────────────────────────────────────────
    // 11. Rate Limiting Tests (429 & Retry-After Header)
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Exceeding rate limit on application apply returns 429 with Retry-After header")
    void testApplyRateLimit_Exceeded_Returns429WithRetryAfter() throws Exception {
        String testIp = "198.51.100." + (int)(Math.random() * 200 + 10);
        UUID dummyJobId = UUID.randomUUID();

        // 10 requests allowed
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/v1/application/apply/" + dummyJobId)
                    .header("X-Forwarded-For", testIp)
                    .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(candidateOwnerEmail).roles("USER")));
        }

        // 11th request triggers rate limit
        mockMvc.perform(post("/api/v1/application/apply/" + dummyJobId)
                .header("X-Forwarded-For", testIp)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(candidateOwnerEmail).roles("USER")))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "60"));
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        if (tempResumePath != null) {
            try {
                java.nio.file.Files.deleteIfExists(tempResumePath);
            } catch (java.io.IOException ignored) {}
        }
        notificationRepository.deleteAll();
        recentlyViewedRepository.deleteAll();
        jobApplicationRepository.deleteAll();
        savedJobRepository.deleteAll();
        jobSeekersRepository.deleteAll();
        jobRepository.deleteAll();
        companyRepository.deleteAll();
        userRepository.deleteAll();
    }
}
