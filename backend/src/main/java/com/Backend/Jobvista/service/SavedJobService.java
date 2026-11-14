package com.Backend.Jobvista.service;

import com.Backend.Jobvista.dto.Job.JobResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public interface SavedJobService {

    void saveJob(UUID jobId, String email);

    void removeSavedJob(UUID jobId, String email);

    boolean toggleSave(UUID jobId, String email);

    Page<JobResponseDTO> getSavedJobs(String email, int page, int size);
}
