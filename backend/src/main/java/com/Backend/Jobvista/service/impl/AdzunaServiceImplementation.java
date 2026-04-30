package com.Backend.Jobvista.service.impl;


import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.external.adzuna.model.AdzunaClient;
import com.Backend.Jobvista.external.adzuna.model.AdzunaJob;
import com.Backend.Jobvista.external.adzuna.model.AdzunaResponse;
import com.Backend.Jobvista.repository.JobRepository;
import com.Backend.Jobvista.service.AdzunaService;
import com.Backend.Jobvista.utills.JobEnrichmentUtil;
import lombok.AllArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import static com.Backend.Jobvista.utills.JobEnrichmentUtil.extractSkills;

@Service
@AllArgsConstructor
public class AdzunaServiceImplementation implements AdzunaService {


    private final AdzunaClient adzunaClient;
    private final JobRepository jobRepository;

    @Override
    public void syncJobs(String keyword) {

        AdzunaResponse response = adzunaClient.searchJobs(keyword,1);

        if (response == null || response.getResults() == null) return;


        for(AdzunaJob ext: response.getResults()){
            if (jobRepository.existsByExternalId(ext.getId())) continue;
            Job job = Job.builder()
                    .externalId(ext.getId())
                    .title(ext.getTitle())
                    .description(ext.getDescription())
                    .companyName(ext.getCompany() != null ? ext.getCompany().getDisplayName() : "Confidential")
                    .location(ext.getLocation() != null ? ext.getLocation().getDisplayName() : "Unknown")
                    .salaryOrStipend(JobEnrichmentUtil.formatSalary(ext.getSalaryMin(), ext.getSalaryMax()))
                    .jobType(JobEnrichmentUtil.detectJobType(ext.getTitle()))
                    .employmentType(JobEnrichmentUtil.detectEmploymentType(ext.getDescription()))
                    .requiredSkills(extractSkills(ext.getDescription()))
                    .experienceRequired(Integer.valueOf(JobEnrichmentUtil.extractExperience(ext.getDescription())))
                    .source("EXTERNAL")
                    .redirectUrl(ext.getRedirectUrl())
                    .postedAt(LocalDateTime.now())
                    .lastDate(LocalDateTime.now().plusDays(30))   // ✅ added
                    .build();

            jobRepository.save(job);

        }


    }
}
