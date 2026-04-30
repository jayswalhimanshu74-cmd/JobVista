package com.Backend.Jobvista.service;

import com.Backend.Jobvista.dto.Job.JobRequestDTO;
import com.Backend.Jobvista.dto.Job.JobResponseDTO;
import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.entity.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public interface JobService {

    JobResponseDTO getJob(Long id);
    JobResponseDTO createJob(JobRequestDTO dto ,String email);

    Page<JobResponseDTO> getAllJobs(int page, int size,String email);

    JobResponseDTO updateJob(UUID jobId, String email, JobRequestDTO dto);

    JobResponseDTO getJobByJobId(UUID jobId, String email);

    void deleteJob(UUID jobId);
    Page<JobResponseDTO> getJobsByCompany(UUID companyId, int page, int size);

    Page<JobResponseDTO> filterJobs(
            String keyword,
            String location,
            JobType jobType,
            UUID companyId,
            int page,
            int size,
            String sortBy);

    List<JobResponseDTO> getFeaturedJobs();
    Page<Job> searchJobs(String keyword, Pageable pageable);

    List<JobResponseDTO> getRecommendedJobs(String email,int page, int size);

    Page<JobResponseDTO> searchJobs(
            String keyword,
            String location,
            Integer minSalary,
            Integer maxSalary,
            int page,
            int size
    );
    List<JobResponseDTO> getRecentJobs(String email);

    Page<JobResponseDTO> searchJobsPublic(String keyword, int page, int size, String email);
}