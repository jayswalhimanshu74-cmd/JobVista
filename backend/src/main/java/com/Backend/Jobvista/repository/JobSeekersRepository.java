package com.Backend.Jobvista.repository;

import com.Backend.Jobvista.entity.JobSeeker;
import com.Backend.Jobvista.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;
import java.util.UUID;


public interface JobSeekersRepository extends JpaRepository<JobSeeker,Long> {


    Optional<JobSeeker> findByJobSeekerId(UUID jobSeekerId);

    Optional<JobSeeker> findByUser(User user);

    boolean existsByUser(User user);
}
