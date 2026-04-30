package com.Backend.Jobvista.service.impl;


import com.Backend.Jobvista.dto.jobSeeker.JobSeekerMapper;
import com.Backend.Jobvista.dto.jobSeeker.JobSeekerRequestDTO;
import com.Backend.Jobvista.dto.jobSeeker.JobSeekersResponseDTO;
import com.Backend.Jobvista.entity.JobSeeker;
import com.Backend.Jobvista.entity.Role;
import com.Backend.Jobvista.entity.User;
import com.Backend.Jobvista.repository.JobSeekersRepository;
import com.Backend.Jobvista.repository.UserRepository;
import com.Backend.Jobvista.service.JobSeekerService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@AllArgsConstructor
public class JobSeekerServiceImplementation  implements JobSeekerService {



    private final  UserRepository userRepository;
    private final JobSeekersRepository jobSeekerRepository;

    @Override
    public JobSeekersResponseDTO createJobSeeker( String email ,JobSeekerRequestDTO dto) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Add validation (important)
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Admin cannot be job seeker");
        }
        if (jobSeekerRepository.existsByUser(user)) {
            throw new RuntimeException("Job seeker profile already exists");
        }

        JobSeeker jobSeeker = JobSeekerMapper.toEntity(dto, user);
        JobSeeker saved = jobSeekerRepository.save(jobSeeker);


        userRepository.save(user);
        return JobSeekerMapper.toResponse(saved,user);
    }

    @Override
    @Transactional
    public String uploadResume(String email, MultipartFile file) {

        //  1. Validate file
        validateResume(file);

        // 2. Fetch user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + email));

        //  3. Fetch JobSeeker
        JobSeeker jobSeeker = jobSeekerRepository.findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Please create JobSeeker profile first"));

        try {
            // 4. Delete old resume if exists
            if (jobSeeker.getResumeUrl() != null) {
                deleteOldResume(jobSeeker.getResumeUrl());
            }

            // 5. Generate unique file name
            String fileName = user.getUserId() + "_" + System.currentTimeMillis()
                    + "_" + file.getOriginalFilename();

            Path uploadPath = Paths.get("uploads/resumes/").toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            Path filePath = uploadPath.resolve(fileName);

            // 6. Save file
            Files.write(filePath, file.getBytes());

            // 7. Store ONLY filename (not full path)
            jobSeeker.setResumeUrl(fileName);
            jobSeekerRepository.save(jobSeeker);

            return fileName;

        } catch (IOException e) {
            throw new RuntimeException("Resume upload failed", e);
        }
    }

    @Override
    public ResponseEntity<Resource> downloadResume(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobSeeker jobSeeker = jobSeekerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (jobSeeker.getResumeUrl() == null) {
            throw new RuntimeException("Resume not uploaded");
        }

        try {
            Path basePath = Paths.get("uploads/resumes/").toAbsolutePath().normalize();

            Path filePath = basePath.resolve(jobSeeker.getResumeUrl()).normalize();

            //  Security check
            if (!filePath.startsWith(basePath)) {
                throw new RuntimeException("Invalid file path");
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new RuntimeException("File not found");
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filePath.getFileName() + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (IOException e) {
            throw new RuntimeException("Error while downloading resume", e);
        }
    }

    @Override
    public JobSeekersResponseDTO getJobSeekerByEmail(String email) {
         User user = userRepository.findByEmail(email).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND, "No profile found"));

         JobSeeker jobSeeker =jobSeekerRepository.findByUser(user).orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "No profile found"));
        return JobSeekerMapper.toResponse(jobSeeker, user);

    }

    @Override
    public JobSeekersResponseDTO updateJobSeeker(String email, JobSeekerRequestDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobSeeker jobSeeker = jobSeekerRepository.findByUser(user)
                .orElseGet(() -> {
                    JobSeeker newProfile = new JobSeeker();
                    newProfile.setUser(user);
                    return newProfile;
                });
        if (dto.getSkills() != null) {
            jobSeeker.setSkills(dto.getSkills());
        }
        if (dto.getExperience() != null) {
            jobSeeker.setExperience(dto.getExperience());
        }
        if (dto.getEducation() != null) {
            jobSeeker.setEducation(dto.getEducation());
        }
        if (dto.getLocation() != null) {
            jobSeeker.setLocation(dto.getLocation());
        }
        if (dto.getProfileSummary() != null) {
            jobSeeker.setProfileSummary(dto.getProfileSummary());
        }

        JobSeeker updated = jobSeekerRepository.save(jobSeeker);
        return JobSeekerMapper.toResponse(updated, user);
    }

    private void validateResume(MultipartFile file) {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > 5 * 1024 * 1024) { // 5MB
            throw new RuntimeException("File too large");
        }

        String contentType = file.getContentType();

        if (!"application/pdf".equals(contentType)) {
            throw new RuntimeException("Only PDF allowed");
        }
    }
    private void deleteOldResume(String path) {
        try {
            Files.deleteIfExists(Paths.get(path));
        } catch (IOException e) {
            // just log, don’t break flow
            System.out.println("Failed to delete old resume: " + path);
        }
    }

    @Override
    public void deleteJobSeeker(String email) {
         
        userRepository.deleteByEmail(email);
    }
}
