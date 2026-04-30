package com.Backend.Jobvista.controller;

import com.Backend.Jobvista.config.SecurityUtill;
import com.Backend.Jobvista.dto.company.CompanyRequestDTO;
import com.Backend.Jobvista.dto.company.CompanyResponseDTO;

import com.Backend.Jobvista.service.CompanyService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/company")
@AllArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final SecurityUtill securityUtill;

    @PutMapping("/id/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyResponseDTO> updateCompany(
            @PathVariable Long id,
            @RequestBody CompanyRequestDTO company
    ) {
        return ResponseEntity.ok(companyService.updateCompany(id, company));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','COMPANY')")
    public ResponseEntity<CompanyResponseDTO> createCompany(
            @RequestBody CompanyRequestDTO dto) {

        String email = securityUtill.getCurrentUserEmail();
        return ResponseEntity.ok(companyService.createCompany(dto, email));
    }

    @DeleteMapping("/id/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<CompanyResponseDTO> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<CompanyResponseDTO> getMyCompany() {
        String email = securityUtill.getCurrentUserEmail();
        return ResponseEntity.ok(companyService.getCompanyByEmail(email));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<CompanyResponseDTO> updateMyCompany(
            @RequestBody CompanyRequestDTO dto
    ) {
        String email = securityUtill.getCurrentUserEmail();
        return ResponseEntity.ok(companyService.updateCompanyByEmail(email, dto));
    }

    @GetMapping("/all")
    public ResponseEntity<Page<CompanyResponseDTO>> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return ResponseEntity.ok(companyService.getAllCompanies(page, size));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Page<CompanyResponseDTO>> searchCompanies(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return ResponseEntity.ok(companyService.searchCompanies(keyword, page, size));
    }
}
