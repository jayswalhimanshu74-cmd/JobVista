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

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT s FROM SavedJob s JOIN FETCH s.job WHERE s.user = :user",
        countQuery = "SELECT count(s) FROM SavedJob s WHERE s.user = :user"
    )
    Page<SavedJob> findByUser(@org.springframework.data.repository.query.Param("user") User user, Pageable pageable);

    Optional<SavedJob> findByUserAndJob(User user, Job job);

    boolean existsByUserAndJob(User user, Job job);

    void deleteByUserAndJob(User user, Job job);

    Optional<SavedJob> findByUserIdAndJobId(Long userId, Long jobId);

    boolean existsByJobAndUser(Job job, User user);

    @org.springframework.data.jpa.repository.Query("SELECT s.job.id FROM SavedJob s WHERE s.user = :user AND s.job.id IN :jobIds")
    java.util.Set<Long> findSavedJobIdsByUser(User user, java.util.List<Long> jobIds);
}
