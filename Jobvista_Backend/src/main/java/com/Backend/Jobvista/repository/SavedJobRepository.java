package com.Backend.Jobvista.repository;

import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.entity.SavedJob;
import com.Backend.Jobvista.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedJobRepository  extends JpaRepository<SavedJob, Long> {

    Page<SavedJob> findByUser(User user, Pageable pageable);

    Optional<SavedJob> findByUserAndJob(User user, Job job);

    boolean existsByUserAndJob(User user, Job job);

    void deleteByUserAndJob(User user, Job job);

    Optional<SavedJob> findByUserIdAndJobId(Long userId, Long jobId);

    boolean existsByJobAndUser(Job job, User user);
}
