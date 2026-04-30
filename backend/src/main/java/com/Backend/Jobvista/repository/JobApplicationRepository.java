package com.Backend.Jobvista.repository;

import com.Backend.Jobvista.entity.ApplicationStatus;
import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.entity.JobApplication;
import com.Backend.Jobvista.entity.JobSeeker;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobApplicationRepository extends JpaRepository<JobApplication,Long>, JpaSpecificationExecutor<Job> {

    boolean existsByJobAndJobSeeker(Job job, JobSeeker jobSeeker);

    Optional<Job> findByJobId(UUID jobId);

    List<JobApplication> findByJobSeeker(JobSeeker jobSeeker); // User

    List<JobApplication> findByJob(Job job); // Company

    Optional<JobApplication> findByJobApplicationId(UUID jobApplicationId);

    Page<JobApplication> findByJobSeeker(JobSeeker jobSeeker, Pageable pageable);

    Page<JobApplication> findByJob(Job job, Pageable pageable);

    Page<JobApplication> findByJobAndApplicationStatus(Job job, ApplicationStatus status, Pageable pageable);

    @Query("""
    SELECT j.title, COUNT(a)
    FROM JobApplication a
    JOIN a.job j
    GROUP BY j.title
    ORDER BY COUNT(a) DESC
    """)
    List<Object[]> getApplicationsPerJob();


    List<JobApplication> findTop5ByOrderByAppliedAtDesc();

    Page<JobApplication> findByApplicationStatus(ApplicationStatus status, Pageable pageable);
}
