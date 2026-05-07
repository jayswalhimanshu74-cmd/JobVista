package com.Backend.Jobvista.controller;

import com.Backend.Jobvista.dto.admin.AdminStatsDTO;
import com.Backend.Jobvista.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getPublicStats() {
        return ResponseEntity.ok(adminService.getStats());
    }
}
