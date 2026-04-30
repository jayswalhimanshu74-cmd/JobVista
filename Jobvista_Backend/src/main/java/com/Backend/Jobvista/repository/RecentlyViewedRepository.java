package com.Backend.Jobvista.repository;


import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.entity.RecentlyViewedJob;
import com.Backend.Jobvista.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecentlyViewedRepository extends JpaRepository<RecentlyViewedJob, Long> {

    Optional<RecentlyViewedJob> findByUserAndJob(User user, Job job);

    List<RecentlyViewedJob> findTop10ByUserOrderByViewedAtDesc(User user);
}