package com.Backend.Jobvista.controller;


import com.Backend.Jobvista.dto.admin.AdminStatsDTO;
import com.Backend.Jobvista.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/applications-per-job")
    public ResponseEntity<List<Map<String, Object>>> getApplicationsPerJob() {
        return ResponseEntity.ok(adminService.getApplicationsPerJob());
    }

    @GetMapping("/top-companies")
    public ResponseEntity<List<Map<String, Object>>> getTopCompanies() {
        return ResponseEntity.ok(adminService.getTopCompanies());
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<Map<String, Object>> getRecentActivity() {
        return ResponseEntity.ok(adminService.getRecentActivity());
    }
}