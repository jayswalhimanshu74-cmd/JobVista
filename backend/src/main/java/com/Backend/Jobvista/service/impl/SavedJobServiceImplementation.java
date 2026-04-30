package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.dto.Job.JobMapper;
import com.Backend.Jobvista.dto.Job.JobResponseDTO;
import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.entity.SavedJob;
import com.Backend.Jobvista.entity.User;
import com.Backend.Jobvista.repository.JobRepository;
import com.Backend.Jobvista.repository.SavedJobRepository;
import com.Backend.Jobvista.repository.UserRepository;
import com.Backend.Jobvista.service.SavedJobService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class SavedJobServiceImplementation implements SavedJobService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final SavedJobRepository savedJobRepository;

    @PreAuthorize("hasRole('USER')")
    @Override
    public void saveJob(UUID jobId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("User Not Found :"));

        Job job =jobRepository.findByJobId(jobId).orElseThrow(()->new RuntimeException("Job Not Found :"));

        if (savedJobRepository.existsByUserAndJob(user, job)) {
            return;
        }
        SavedJob savedJob = SavedJob.builder()
                .user(user)
                .job(job)
                .savedAt(LocalDateTime.now())
                .build();

        savedJobRepository.save(savedJob);
    }


    @PreAuthorize("hasRole('USER')")
    @Override
    public void removeSavedJob(UUID jobId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("User Not Found :"));

        Job job =jobRepository.findByJobId(jobId).orElseThrow(()->new RuntimeException("Job Not Found :"));

        savedJobRepository.deleteByUserAndJob(user,job);
    }

    @Override
    @PreAuthorize("hasRole('USER')")
    public Page<JobResponseDTO> getSavedJobs(String email,int page , int size ) {
        User user = userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("User Not Found :"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("savedAt").descending());

        return savedJobRepository.findByUser(user, pageable)
                .map(savedJob -> {
                    return JobMapper.toResponse(savedJob.getJob());
                });
    }

    @Override
    @PreAuthorize("hasRole('USER')")
    public boolean toggleSave(UUID jobId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Optional<SavedJob> existing = savedJobRepository.findByUserAndJob(user, job);

        if (existing.isPresent()) {
            savedJobRepository.delete(existing.get());
            return false;
        }

        SavedJob savedJob = SavedJob.builder()
                .user(user)
                .job(job)
                .build();

        savedJobRepository.save(savedJob);
        return true;
    }
}
