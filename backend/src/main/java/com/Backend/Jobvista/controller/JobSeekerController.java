package com.Backend.Jobvista.controller;


import com.Backend.Jobvista.config.SecurityUtill;
import com.Backend.Jobvista.dto.jobSeeker.JobSeekerRequestDTO;
import com.Backend.Jobvista.dto.jobSeeker.JobSeekersResponseDTO;
import com.Backend.Jobvista.service.JobSeekerService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/jobSeeker")
public class JobSeekerController {

    private final JobSeekerService jobSeekerService;
    private final SecurityUtill securityUtill;

    @PostMapping("/register")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<JobSeekersResponseDTO> registerJobSeeker(
            @RequestBody JobSeekerRequestDTO dto,
            Authentication authentication
    ) {
        String email = authentication.getName();

        JobSeekersResponseDTO response =
                jobSeekerService.createJobSeeker(email, dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/upload-resume")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> uploadResume(
            @RequestParam("file") MultipartFile file
    ) {
        String email = securityUtill.getCurrentUserEmail();

        String filePath = jobSeekerService.uploadResume(email, file);

        return ResponseEntity.ok("Resume uploaded: " + filePath);
    }
    @GetMapping("/resume")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Resource> downloadResume() {

        String email = securityUtill.getCurrentUserEmail();

        return jobSeekerService.downloadResume(email);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<JobSeekersResponseDTO> getMyProfile() {
        String email = securityUtill.getCurrentUserEmail();
        return ResponseEntity.ok(jobSeekerService.getJobSeekerByEmail(email));

    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<JobSeekersResponseDTO> updateMyProfile(
            @RequestBody JobSeekerRequestDTO dto) {
        String email = securityUtill.getCurrentUserEmail();
        return ResponseEntity.ok(jobSeekerService.updateJobSeeker(email, dto));
    }
}
