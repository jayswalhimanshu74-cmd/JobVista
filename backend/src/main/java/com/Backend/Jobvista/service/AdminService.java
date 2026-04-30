package com.Backend.Jobvista.service;


import com.Backend.Jobvista.dto.admin.AdminStatsDTO;

import java.util.List;
import java.util.Map;


public interface AdminService {

    AdminStatsDTO getStats();

    List<Map<String, Object>> getApplicationsPerJob();

    List<Map<String, Object>> getTopCompanies();

    Map<String, Object> getRecentActivity();
}