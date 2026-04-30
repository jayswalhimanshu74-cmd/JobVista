package com.Backend.Jobvista.service;



import com.Backend.Jobvista.dto.company.CompanyRequestDTO;
import com.Backend.Jobvista.dto.company.CompanyResponseDTO;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
public interface CompanyService {

    CompanyResponseDTO createCompany(CompanyRequestDTO dto, String email);

    CompanyResponseDTO updateCompany(Long id, CompanyRequestDTO company);
    CompanyResponseDTO updateCompanyByEmail(String email, CompanyRequestDTO company);

    void deleteCompany(Long id);

    CompanyResponseDTO getCompanyById(Long id);

    CompanyResponseDTO getCompanyByEmail(String email);

    Page<CompanyResponseDTO> getAllCompanies(int page, int size);

    Page<CompanyResponseDTO> searchCompanies(String keyword, int page, int size);
}