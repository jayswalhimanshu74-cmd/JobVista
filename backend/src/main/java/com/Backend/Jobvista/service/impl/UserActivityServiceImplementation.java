package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.entity.RecentlyViewedJob;
import com.Backend.Jobvista.entity.User;
import com.Backend.Jobvista.repository.RecentlyViewedRepository;
import com.Backend.Jobvista.service.UserActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserActivityServiceImplementation implements UserActivityService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory
            .getLogger(UserActivityServiceImplementation.class);

    private final RecentlyViewedRepository recentlyViewedRepository;

    public UserActivityServiceImplementation(RecentlyViewedRepository recentlyViewedRepository) {
        this.recentlyViewedRepository = recentlyViewedRepository;
    }

    @Async
    @Override
    public void trackJobView(User user, Job job) {
        try {
            Optional<RecentlyViewedJob> existing = recentlyViewedRepository.findByUserAndJob(user, job);

            if (existing.isPresent()) {
                RecentlyViewedJob viewed = existing.get();
                viewed.setViewedAt(LocalDateTime.now());
                recentlyViewedRepository.save(viewed);
            } else {
                RecentlyViewedJob newView = RecentlyViewedJob.builder()
                        .user(user)
                        .job(job)
                        .viewedAt(LocalDateTime.now())
                        .build();
                recentlyViewedRepository.save(newView);
            }
        } catch (Exception ex) {
            log.warn("Could not track job view for user {} and job {}: {}", user.getUserId(), job.getJobId(),
                    ex.getMessage());
        }
    }
}
