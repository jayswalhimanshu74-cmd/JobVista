package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.external.adzuna.model.AdzunaClient;
import com.Backend.Jobvista.external.adzuna.model.AdzunaJob;
import com.Backend.Jobvista.external.adzuna.model.AdzunaResponse;
import com.Backend.Jobvista.repository.JobRepository;
import com.Backend.Jobvista.service.AdzunaService;
import com.Backend.Jobvista.utills.JobEnrichmentUtil;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AdzunaServiceImplementation implements AdzunaService {

    private final AdzunaClient adzunaClient;
    private final JobRepository jobRepository;
    private static final Logger log = LoggerFactory.getLogger(AdzunaServiceImplementation.class);

    @Override
    @Async
    public void syncJobs(String keyword) {
        syncJobsSync(keyword);
    }

    @Override
    public boolean isDailyCapReached() {
        return adzunaClient.isDailyCapReached();
    }

    @Override
    public int getDailyCallCount() {
        return adzunaClient.getDailyCallCount();
    }

    @Override
    public int syncJobsSync(String keyword) {
        long startTime = System.currentTimeMillis();
        log.info("Starting external job sync for keyword: '{}'", keyword);

        AdzunaResponse response;
        try {
            response = adzunaClient.searchJobs(keyword, 1);
        } catch (Exception e) {
            log.error("Adzuna sync failed while calling API for keyword '{}': {}", keyword, e.getMessage());
            return 0;
        }

        if (response == null || response.getResults() == null || response.getResults().isEmpty()) {
            long duration = System.currentTimeMillis() - startTime;
            log.info("Adzuna sync finished for keyword '{}': fetched=0, saved=0, skippedDuplicates=0, failures=0, duration={}ms",
                    keyword, duration);
            return 0;
        }

        List<AdzunaJob> results = response.getResults();
        int fetchedCount = results.size();

        // 1. De-duplicate IDs within the incoming batch in memory
        Set<String> batchIds = new LinkedHashSet<>();
        List<AdzunaJob> uniqueBatchJobs = new ArrayList<>();
        int inBatchDuplicateCount = 0;

        for (AdzunaJob ext : results) {
            if (ext.getId() != null && !ext.getId().isBlank()) {
                if (batchIds.add(ext.getId())) {
                    uniqueBatchJobs.add(ext);
                } else {
                    inBatchDuplicateCount++;
                }
            }
        }

        // 2. Query database ONCE for all external IDs present in this batch
        Set<String> existingDbIds = Collections.emptySet();
        if (!batchIds.isEmpty()) {
            try {
                existingDbIds = jobRepository.findAllByExternalIdIn(batchIds).stream()
                        .map(Job::getExternalId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
            } catch (Exception e) {
                log.error("Failed to query existing external IDs for keyword '{}': {}", keyword, e.getMessage());
            }
        }

        List<Job> jobsToSave = new ArrayList<>();
        int skippedDuplicates = inBatchDuplicateCount;
        int failures = 0;

        // 3. Map new jobs with per-job fault isolation and field bounds
        for (AdzunaJob ext : uniqueBatchJobs) {
            if (existingDbIds.contains(ext.getId())) {
                skippedDuplicates++;
                continue;
            }

            try {
                String title = JobEnrichmentUtil.truncate(ext.getTitle(), 255);
                if (title == null || title.isBlank()) {
                    title = "Untitled Job";
                }

                String rawDesc = ext.getDescription();
                String description = JobEnrichmentUtil.truncate(rawDesc, 2000);

                String companyName = ext.getCompany() != null && ext.getCompany().getDisplayName() != null
                        ? ext.getCompany().getDisplayName()
                        : "Confidential";
                companyName = JobEnrichmentUtil.truncate(companyName, 255);

                String location = ext.getLocation() != null && ext.getLocation().getDisplayName() != null
                        ? ext.getLocation().getDisplayName()
                        : "Unknown";
                location = JobEnrichmentUtil.truncate(location, 255);

                String redirectUrl = ext.getRedirectUrl();
                String requiredSkills = JobEnrichmentUtil.truncate(JobEnrichmentUtil.extractSkills(rawDesc), 255);
                int experience = JobEnrichmentUtil.parseExperience(rawDesc);

                Job job = Job.builder()
                        .externalId(ext.getId())
                        .title(title)
                        .description(description)
                        .company(null) // ✅ Option A: company is nullable
                        .companyName(companyName)
                        .location(location)
                        .salaryOrStipend(JobEnrichmentUtil.formatSalary(ext.getSalaryMin(), ext.getSalaryMax()))
                        .jobType(JobEnrichmentUtil.detectJobType(title))
                        .employmentType(JobEnrichmentUtil.detectEmploymentType(rawDesc))
                        .requiredSkills(requiredSkills)
                        .experienceRequired(experience)
                        .source("EXTERNAL")
                        .redirectUrl(redirectUrl)
                        .postedAt(LocalDateTime.now())
                        .lastDate(LocalDateTime.now().plusDays(30))
                        .build();

                jobsToSave.add(job);
            } catch (Exception e) {
                failures++;
                log.warn("Failed to map Adzuna job ID '{}' for keyword '{}': {}", ext.getId(), keyword, e.getMessage());
            }
        }

        // 4. Batch persist new jobs
        int savedCount = 0;
        if (!jobsToSave.isEmpty()) {
            try {
                List<Job> savedJobs = jobRepository.saveAll(jobsToSave);
                savedCount = savedJobs.size();
            } catch (Exception e) {
                log.error("Failed to save batch of {} external jobs for keyword '{}': {}", jobsToSave.size(), keyword, e.getMessage());
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("Adzuna sync finished for keyword '{}': fetched={}, saved={}, skippedDuplicates={}, failures={}, duration={}ms",
                keyword, fetchedCount, savedCount, skippedDuplicates, failures, duration);

        return savedCount;
    }
}
