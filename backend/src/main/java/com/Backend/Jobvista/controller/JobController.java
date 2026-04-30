package com.Backend.Jobvista.controller;

import com.Backend.Jobvista.config.SecurityUtill;
import com.Backend.Jobvista.dto.Job.JobRequestDTO;
import com.Backend.Jobvista.dto.Job.JobResponseDTO;
import com.Backend.Jobvista.service.AdzunaService;
import com.Backend.Jobvista.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/v1/job")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final AdzunaService adzunaService;
    private final SecurityUtill securityUtill;

    // ✅ Anyone logged in
    @GetMapping("/all")
    public Page<JobResponseDTO> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getPrincipal()))
                ? auth.getName() : null;
        return jobService.getAllJobs(page, size,email);
    }

    // ✅ Anyone (public search)
    @GetMapping("/search")
    public Page<JobResponseDTO> searchJobs(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getPrincipal()))
                ? auth.getName() : null;
        return jobService.searchJobsPublic(keyword, page, size, email);
    }

    // ✅ ADMIN ONLY
    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<JobResponseDTO> postJob(
            @Valid @RequestBody JobRequestDTO dto) {

         String email =securityUtill.getCurrentUserEmail();
        return ResponseEntity.ok(jobService.createJob(dto,email));
    }

    // ✅ ADMIN ONLY
    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasAnyRole('ADMIN','COMPANY')")
    public String deleteJob(@PathVariable UUID jobId) {
        jobService.deleteJob(jobId);
        return "Job deleted successfully";
    }

    // ✅ ADMIN ONLY
    @PostMapping("/sync")
    @PreAuthorize("hasRole('ADMIN')")
    public String syncExternalJobs(@RequestParam String keyword) {
        adzunaService.syncJobs(keyword);
        return "Sync completed";
    }

    @GetMapping("/recommend")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<JobResponseDTO>> getRecommendedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String email = securityUtill.getCurrentUserEmail();
        return ResponseEntity.ok(
                jobService.getRecommendedJobs(email, page, size)
        );
    }
    @PutMapping("/{jobId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<JobResponseDTO> updateJob(
            @PathVariable UUID jobId,
            @RequestBody JobRequestDTO dto
    ) {
        String email = securityUtill.getCurrentUserEmail();

        JobResponseDTO updatedJob = jobService.updateJob(jobId, email, dto);

        return ResponseEntity.ok(updatedJob);
    }
    @GetMapping("/{jobId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<JobResponseDTO> getJobById(@PathVariable UUID jobId) {

        String email = securityUtill.getCurrentUserEmail();

        return ResponseEntity.ok(
                jobService.getJobByJobId(jobId, email)
        );
    }
    @GetMapping("/recent")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<JobResponseDTO>> getRecentJobs() {

        String email = securityUtill.getCurrentUserEmail();

        return ResponseEntity.ok(
                jobService.getRecentJobs(email)
        );
    }
    @GetMapping("/company/{companyId}")
    public ResponseEntity<Page<JobResponseDTO>> getJobsByCompany(
            @PathVariable UUID companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                jobService.getJobsByCompany(companyId, page, size)
        );
    }
    @GetMapping("/featured")
    public ResponseEntity<List<JobResponseDTO>> getFeaturedJobs() {
        return ResponseEntity.ok(jobService.getFeaturedJobs());
    }
}