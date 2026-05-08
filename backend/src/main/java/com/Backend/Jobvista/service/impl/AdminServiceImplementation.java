package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.dto.admin.AdminStatsDTO;
import com.Backend.Jobvista.dto.Job.JobMapper;
import com.Backend.Jobvista.dto.JobApplication.JobApplicationMapper;
import com.Backend.Jobvista.dto.user.UserMapper;
import com.Backend.Jobvista.repository.CompanyRepository;
import com.Backend.Jobvista.repository.JobApplicationRepository;
import com.Backend.Jobvista.repository.JobRepository;
import com.Backend.Jobvista.repository.UserRepository;
import com.Backend.Jobvista.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminServiceImplementation implements AdminService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private  final JobApplicationRepository applicationRepository;

    @Override
    public AdminStatsDTO getStats() {
        return AdminStatsDTO.builder()
                .totalUsers(userRepository.count())
                .totalCompanies(companyRepository.count())
                .totalJobs(jobRepository.count())
                .totalApplications(applicationRepository.count())
                .build();
    }

    @Override
    public List<Map<String, Object>> getApplicationsPerJob() {

        return applicationRepository.getApplicationsPerJob()
                .stream()
                .map(obj -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("jobTitle", obj[0]);
                    map.put("applications", obj[1]);
                    return map;
                })
                .toList();
    }

    @Override
    public List<Map<String, Object>> getTopCompanies() {
        return jobRepository.getTopCompanies()
                .stream()
                .map(obj -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("companyName", obj[0]);
                    map.put("jobsPosted", obj[1]);
                    return map;
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getRecentActivity() {
        Map<String, Object> activity = new HashMap<>();

        activity.put("recentJobs",
                jobRepository.findTop5ByOrderByPostedAtDesc()
                        .stream()
                        .map(job -> JobMapper.toResponse(job))
                        .toList());

        activity.put("recentApplications",
                applicationRepository.findTop5ByOrderByAppliedAtDesc()
                        .stream()
                        .map(application -> JobApplicationMapper.toResponse(application))
                        .toList());

        activity.put("recentUsers",
                userRepository.findTop5ByOrderByCreatedAtDesc()
                        .stream()
                        .map(UserMapper::toResponse)
                        .toList());

        return activity;
    }
}
