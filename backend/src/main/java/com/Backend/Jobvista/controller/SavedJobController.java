package com.Backend.Jobvista.controller;


import com.Backend.Jobvista.config.SecurityUtill;
import com.Backend.Jobvista.dto.Job.JobResponseDTO;
import com.Backend.Jobvista.service.SavedJobService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/saved-jobs")
public class SavedJobController {

    private final SavedJobService savedJobService;
    private final SecurityUtill securityUtil;

    // Save job
    @PostMapping("/{jobId}")
    @PreAuthorize("hasRole('USER')")
    public String saveJob(@PathVariable UUID jobId) {

        String email = securityUtil.getCurrentUserEmail();
        savedJobService.saveJob(jobId, email);

        return "Job saved successfully";
    }

    //  Remove saved job
    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('USER')")
    public String removeSavedJob(@PathVariable UUID jobId) {

        String email = securityUtil.getCurrentUserEmail();
        savedJobService.removeSavedJob(jobId, email);

        return "Saved job removed";
    }

    //  Get all saved jobs
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public Page<JobResponseDTO> getSavedJobs(
            @RequestParam(defaultValue = "10") int page,
            @RequestParam(defaultValue = "10") int size) {

        String email = securityUtil.getCurrentUserEmail();
        return savedJobService.getSavedJobs(email,page , size);
    }

    @PostMapping("/{jobId}/toggle")
    public String toggleSave(@PathVariable UUID jobId) {

        String email = securityUtil.getCurrentUserEmail();

        boolean saved = savedJobService.toggleSave(jobId, email);

        return saved ? "Job saved" : "Job removed";
    }

}
