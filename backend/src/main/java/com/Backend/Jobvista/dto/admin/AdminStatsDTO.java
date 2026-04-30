package com.Backend.Jobvista.dto.admin;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsDTO {

    private long totalUsers;
    private long totalCompanies;
    private long totalJobs;
    private long totalApplications;
}
