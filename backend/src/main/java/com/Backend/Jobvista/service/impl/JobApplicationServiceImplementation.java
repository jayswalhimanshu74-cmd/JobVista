package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.dto.JobApplication.JobApplicationMapper;
import com.Backend.Jobvista.dto.JobApplication.JobApplicationResponseDToO;
import com.Backend.Jobvista.entity.*;
import com.Backend.Jobvista.event.ApplicationEvent;
import com.Backend.Jobvista.repository.*;
import com.Backend.Jobvista.service.JobApplicationService;
import org.springframework.context.ApplicationEventPublisher;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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
                .build();

        JobApplication saved = applicationRepository.save(application);
        eventPublisher.publishEvent(
                new ApplicationEvent(
                        user.getEmail(),
                        user.getName(),
                        job.getTitle(),
                        "APPLIED",
                        ApplicationEvent.EventType.APPLICATION_SUBMITTED,
                        null
                )
        );
        return JobApplicationMapper.toResponse(saved);
    }

    @Override
    public List<JobApplicationResponseDToO> getApplicationsByJobSeeker(UUID jobSeekerId) {
        JobSeeker jobSeeker = jobSeekerRepository.findByJobSeekerId(jobSeekerId)
                .orElseThrow(() -> new RuntimeException("Job seeker not found"));

        return applicationRepository.findByJobSeeker(jobSeeker)
                .stream()
                .map(JobApplicationMapper::toResponse)
                .toList();
    }
    @Override
    @PreAuthorize("hasRole('USER')")
    public Page<JobApplicationResponseDToO> getMyApplications( String email ,int page, int size) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.Optional<JobSeeker> jobSeekerOpt = jobSeekerRepository.findByUser(user);
        if (jobSeekerOpt.isEmpty()) {
            return Page.empty();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());

        return applicationRepository.findByJobSeeker(jobSeekerOpt.get(), pageable)
                .map(JobApplicationMapper::toResponse);
    }

    @Override
    @PreAuthorize("hasRole('COMPANY')")
    public Page<JobApplicationResponseDToO> getApplicationsByJob(
            UUID jobId,
            ApplicationStatus status,
            int page
          , int size) {

        Job job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());

        Page<JobApplication> applications;

        if (status != null) {
            applications = applicationRepository
                    .findByJobAndApplicationStatus(job, status, pageable);
        } else {
            applications = applicationRepository
                    .findByJob(job, pageable);
        }

        return applications.map(JobApplicationMapper::toResponse);
    }

    @Override
    @PreAuthorize("hasAnyRole('COMPANY','ADMIN','USER')")
    @Transactional
    public JobApplicationResponseDToO updateApplicationStatus(
            UUID applicationId,
            ApplicationStatus status
    ) {
        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();
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
            if (!application.getJob().getCompany().getId()
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
                        null
                )
        );

        return JobApplicationMapper.toResponse(updated);
    }

    @Override
    public Page<JobApplicationResponseDToO> getApplicationsByJobSeeker(UUID jobSeekerId, int page, int size) {
        JobSeeker jobSeeker = jobSeekerRepository.findByJobSeekerId(jobSeekerId)
                .orElseThrow(() -> new RuntimeException("Job seeker not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());

        return applicationRepository.findByJobSeeker(jobSeeker, pageable)
                .map(JobApplicationMapper::toResponse);
    }

    private void validateStatusTransition(
            ApplicationStatus currentStatus,
            ApplicationStatus newStatus
    ) {

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

        if (currentStatus == ApplicationStatus.REJECTED){
            throw  new RuntimeException(
                    "Rejected Job-Seekers could not update their status"
            );
        }
        throw new RuntimeException(
                "Invalid status transition from " + currentStatus + " to " + newStatus
        );
    }

    private void validateCompanyOwnership(Job job, UUID companyId) {
        if (!job.getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("You are not authorized to access this job");
        }
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public Page<JobApplicationResponseDToO> getAllApplications(ApplicationStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());

        Page<JobApplication> applications;
        if (status != null) {
            applications = applicationRepository.findByApplicationStatus(status, pageable);
        } else {
            applications = applicationRepository.findAll(pageable);
        }

        return applications.map(JobApplicationMapper::toResponse);
    }

}
