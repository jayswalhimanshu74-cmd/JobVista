package com.Backend.Jobvista.controller;


import com.Backend.Jobvista.config.SecurityUtill;
import com.Backend.Jobvista.dto.JobApplication.JobApplicationResponseDToO;
import com.Backend.Jobvista.entity.ApplicationStatus;
import com.Backend.Jobvista.service.JobApplicationService;

import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/application")
public class JobApplicationController {

   
    private final JobApplicationService applicationService;
   

    private final SecurityUtill securityUtil;


    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('USER')")

    public ResponseEntity<JobApplicationResponseDToO> applyJob(
            @PathVariable UUID jobId){

        String email = securityUtil.getCurrentUserEmail();

        JobApplicationResponseDToO job = applicationService.applyToJob(jobId, email);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        System.out.println("AUTH NAME = " + auth.getName());
        System.out.println("AUTHORITIES = " + auth.getAuthorities());

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(job);
    }


    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<JobApplicationResponseDToO>> getMyApplications(
            @RequestParam int page,
            @RequestParam int size) {

        String email = securityUtil.getCurrentUserEmail();

        return ResponseEntity.ok(
                applicationService.getMyApplications(email, page, size)
        );
    }

    // Get all applications for a job (company dashboard)
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('COMPANY')")
    public Page<JobApplicationResponseDToO> getApplicationsByJob(
            @PathVariable UUID jobId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return applicationService.getApplicationsByJob(jobId, status, page, size);
    }

    // Update application status (company only)
    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasAnyRole('COMPANY','ADMIN')")
    public ResponseEntity<String> updateStatus(
            @PathVariable UUID applicationId,
            @RequestParam ApplicationStatus status) {

        applicationService.updateApplicationStatus(applicationId, status);
        return ResponseEntity.ok("Status updated successfully");
    }

    // Admin: get ALL applications across the platform
    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<JobApplicationResponseDToO>> getAllApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(
                applicationService.getAllApplications(status, page, size)
        );
    }
}
