package com.Backend.Jobvista.service;

import com.Backend.Jobvista.dto.JobApplication.JobApplicationResponseDToO;
import com.Backend.Jobvista.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public interface JobApplicationService {

    JobApplicationResponseDToO applyToJob(UUID jobId, String email);

    List<JobApplicationResponseDToO> getApplicationsByJobSeeker(UUID jobSeekerId);

    Page<JobApplicationResponseDToO> getMyApplications( String email ,int page, int size);

     JobApplicationResponseDToO updateApplicationStatus(UUID applicationId, ApplicationStatus status);

    Page<JobApplicationResponseDToO> getApplicationsByJobSeeker(
            UUID jobSeekerId,
            int page,
            int size);
    Page<JobApplicationResponseDToO> getApplicationsByJob(
            UUID jobId
            ,   ApplicationStatus status,
            int page
         ,
            int size);

    Page<JobApplicationResponseDToO> getAllApplications(ApplicationStatus status, int page, int size);
}
