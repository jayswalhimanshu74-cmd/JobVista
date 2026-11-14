package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.dto.JobApplication.JobApplicationMapper;
import com.Backend.Jobvista.dto.JobApplication.JobApplicationResponseDToO;
import com.Backend.Jobvista.entity.*;
import com.Backend.Jobvista.event.ApplicationEvent;
import com.Backend.Jobvista.repository.*;
import com.Backend.Jobvista.service.JobApplicationService;

import io.swagger.v3.oas.models.media.MediaType;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.UrlResource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.net.http.HttpHeaders;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class JobApplicationServiceImplementation implements JobApplicationService {

        private final JobRepository jobRepository;
        private final JobApplicationRepository applicationRepository;
        private final JobSeekersRepository jobSeekerRepository;
        private final UserRepository userRepository;
        private final CompanyRepository companyRepository;
        private final ApplicationEventPublisher eventPublisher;

        @Override
        @PreAuthorize("hasRole('USER')")
        @Transactional
        public JobApplicationResponseDToO applyToJob(UUID jobId, String email) {

                Job job = jobRepository.findByJobId(jobId)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Job not found"));

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

                // Auto-create JobSeeker profile if it doesn't exist yet
                JobSeeker jobSeeker = jobSeekerRepository.findByUser(user)
                                .orElseGet(() -> {
                                        JobSeeker newProfile = new JobSeeker();
                                        newProfile.setUser(user);
                                        newProfile.setJobSeekerId(UUID.randomUUID());
                                        return jobSeekerRepository.save(newProfile);
                                });

                if (applicationRepository.existsByJobAndJobSeeker(job, jobSeeker)) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.CONFLICT,
                                        "You have already applied for this job.");
                }

                JobApplication application = JobApplication.builder()
                                .job(job)
                                .jobSeeker(jobSeeker)
                                .jobApplicationId(UUID.randomUUID())
                                .applicationStatus(ApplicationStatus.APPLIED)
                                .appliedAt(java.time.LocalDateTime.now())
                                .build();

                JobApplication saved = applicationRepository.save(application);

                // Fire-and-forget: run notification in a separate thread so it NEVER blocks the
                // response
                final String userEmail = user.getEmail();
                final String userName = user.getName();
                final String jobTitle = job.getTitle();
                java.util.concurrent.CompletableFuture.runAsync(() -> {
                        try {
                                eventPublisher.publishEvent(
                                                new ApplicationEvent(
                                                                userEmail,
                                                                userName,
                                                                jobTitle,
                                                                "APPLIED",
                                                                ApplicationEvent.EventType.APPLICATION_SUBMITTED,
                                                                null));
                        } catch (Exception e) {
                                System.err.println("Background notification failed (non-blocking): " + e.getMessage());
                        }
                });

                return JobApplicationMapper.toResponse(saved);
        }

        @Override
        public List<JobApplicationResponseDToO> getApplicationsByJobSeeker(UUID jobSeekerId) {
                JobSeeker jobSeeker = jobSeekerRepository.findByJobSeekerId(jobSeekerId)
                                .orElseThrow(() -> new RuntimeException("Job seeker not found"));

                return applicationRepository.findByJobSeeker(jobSeeker)
                                .stream()
                                .map(application -> JobApplicationMapper.toResponse(application))
                                .toList();
        }

        @Override
        @PreAuthorize("hasRole('USER')")
        @Transactional(readOnly = true)
        public Page<JobApplicationResponseDToO> getMyApplications(String email, int page, int size) {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                java.util.Optional<JobSeeker> jobSeekerOpt = jobSeekerRepository.findByUser(user);
                if (jobSeekerOpt.isEmpty()) {
                        return Page.empty();
                }

                Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());

                return applicationRepository.findByJobSeeker(jobSeekerOpt.get(), pageable)
                                .map(application -> JobApplicationMapper.toResponse(application));
        }

        @Override
        @Transactional(readOnly = true)
        @PreAuthorize("hasRole('COMPANY')")
        public Page<JobApplicationResponseDToO> getApplicationsByJob(
                        UUID jobId,
                        ApplicationStatus status,
                        int page, int size) {

                Job job = jobRepository.findByJobId(jobId)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Job not found"));
                Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());

                Page<JobApplication> applications;

                if (status != null) {
                        applications = applicationRepository
                                        .findByJobAndApplicationStatus(job, status, pageable);
                } else {
                        applications = applicationRepository
                                        .findByJob(job, pageable);
                }

                return applications.map(application -> JobApplicationMapper.toResponse(application));
        }

        @Override
        @PreAuthorize("hasAnyRole('COMPANY','ADMIN','USER')")
        @Transactional
        public JobApplicationResponseDToO updateApplicationStatus(
                        UUID applicationId,
                        ApplicationStatus status) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String email = auth.getName();

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                JobApplication application = applicationRepository
                                .findByJobApplicationId(applicationId)
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                // Only enforce company ownership for non-admin users
                boolean isAdmin = user.getRole() == com.Backend.Jobvista.entity.Role.ADMIN;
                if (!isAdmin) {
                        Company company = companyRepository.findByUser(user)
                                        .orElseThrow(() -> new RuntimeException("Company not found"));
                        if (application.getJob().getCompany() == null || !application.getJob().getCompany().getId()
                                        .equals(company.getId())) {
                                throw new RuntimeException("Unauthorized");
                        }
                }

                validateStatusTransition(application.getApplicationStatus(), status);

                application.setApplicationStatus(status);
                JobSeeker jobSeeker = application.getJobSeeker();

                JobApplication updated = applicationRepository.save(application);

                eventPublisher.publishEvent(
                                new ApplicationEvent(
                                                jobSeeker.getUser().getEmail(),
                                                jobSeeker.getUser().getName(),
                                                application.getJob().getTitle(),
                                                status.name(),
                                                ApplicationEvent.EventType.STATUS_CHANGED,
                                                null));

                return JobApplicationMapper.toResponse(updated);
        }

        @Override
        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public Page<JobApplicationResponseDToO> getApplicationsByJobSeeker(UUID jobSeekerId, int page, int size) {
                JobSeeker jobSeeker = jobSeekerRepository.findByJobSeekerId(jobSeekerId)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Job seeker not found"));

                Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());

                return applicationRepository.findByJobSeeker(jobSeeker, pageable)
                                .map(application -> JobApplicationMapper.toResponse(application));
        }

        private void validateStatusTransition(
                        ApplicationStatus currentStatus,
                        ApplicationStatus newStatus) {

                if (currentStatus == ApplicationStatus.APPLIED) {
                        if (newStatus == ApplicationStatus.SHORTLISTED ||
                                        newStatus == ApplicationStatus.REJECTED) {
                                return;
                        }
                }

                if (currentStatus == ApplicationStatus.SHORTLISTED) {
                        if (newStatus == ApplicationStatus.HIRED ||
                                        newStatus == ApplicationStatus.REJECTED) {
                                return;
                        }
                }

                if (currentStatus == ApplicationStatus.REJECTED) {
                        throw new RuntimeException(
                                        "Rejected Job-Seekers could not update their status");
                }
                throw new RuntimeException(
                                "Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        private void validateCompanyOwnership(Job job, UUID companyId) {
                if (job.getCompany() == null || !job.getCompany().getCompanyId().equals(companyId)) {
                        throw new RuntimeException("You are not authorized to access this job");
                }
        }

        @Override
        @Transactional(readOnly = true)
        @PreAuthorize("isAuthenticated()")
        public Page<JobApplicationResponseDToO> getAllApplications(ApplicationStatus status, int page, int size) {
                Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());

                Page<JobApplication> applications;
                if (status != null) {
                        applications = applicationRepository.findByApplicationStatus(status, pageable);
                } else {
                        applications = applicationRepository.findAll(pageable);
                }

                return applications.map(application -> JobApplicationMapper.toResponse(application));
        }

        @Override
        @PreAuthorize("hasRole('USER')")
        @Transactional
        public void withdrawApplication(UUID jobId, String email) {
                Job job = jobRepository.findByJobId(jobId)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Job not found"));

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

                JobSeeker jobSeeker = jobSeekerRepository.findByUser(user)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Job seeker profile not found"));

                JobApplication application = applicationRepository.findByJobAndJobSeeker(job, jobSeeker)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Application not found"));

                // Only allow withdrawal if still in APPLIED status
                if (application.getApplicationStatus() != ApplicationStatus.APPLIED) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.BAD_REQUEST,
                                        "Cannot withdraw application with status: "
                                                        + application.getApplicationStatus());
                }

                applicationRepository.delete(application);
        }

        @Override
        @Transactional(readOnly = true)
        public ResponseEntity<Resource> downloadResume(UUID applicationId) {
                JobApplication application = applicationRepository.findByJobApplicationId(applicationId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Application not found"));

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String currentUserEmail = auth != null ? auth.getName() : null;
                boolean isAdmin = auth != null && auth.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                if (!isAdmin) {
                        boolean isApplicant = application.getJobSeeker() != null
                                        && application.getJobSeeker().getUser() != null
                                        && application.getJobSeeker().getUser().getEmail() != null
                                        && application.getJobSeeker().getUser().getEmail().equals(currentUserEmail);

                        boolean isJobOwner = application.getJob() != null
                                        && application.getJob().getCompany() != null
                                        && application.getJob().getCompany().getUser() != null
                                        && application.getJob().getCompany().getUser().getEmail() != null
                                        && application.getJob().getCompany().getUser().getEmail()
                                                        .equals(currentUserEmail);

                        if (!isApplicant && !isJobOwner) {
                                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                                "Access denied: you are not authorized to access this resume");
                        }
                }

                JobSeeker seeker = application.getJobSeeker();
                if (seeker == null || seeker.getResumeUrl() == null) {
                        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume not uploaded");
                }

                if (seeker.getResumeUrl().startsWith("http")) {
                        return ResponseEntity.status(HttpStatus.FOUND)
                                        .location(java.net.URI.create(seeker.getResumeUrl()))
                                        .build();
                }

                try {
                        Path basePath = Paths.get("uploads/resumes/").toAbsolutePath().normalize();
                        Path filePath = basePath.resolve(seeker.getResumeUrl()).normalize();

                        if (!filePath.startsWith(basePath)) {
                                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
                        }

                        Resource resource = new UrlResource(filePath.toUri());
                        if (!resource.exists()) {
                                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found on storage");
                        }

                        String contentType = Files.probeContentType(filePath);
                        if (contentType == null) {
                                contentType = "application/pdf";
                        }

                        return ResponseEntity.ok()
                                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                                        "attachment; filename=\"" + filePath.getFileName() + "\"")
                                        .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                                        .body(resource);
                } catch (IOException e) {
                        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading resume file",
                                        e);
                }
        }
}
