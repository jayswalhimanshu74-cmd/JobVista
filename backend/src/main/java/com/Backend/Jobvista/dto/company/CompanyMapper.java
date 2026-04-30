package com.Backend.Jobvista.dto.company;

import com.Backend.Jobvista.entity.Company;
import com.Backend.Jobvista.entity.User;

public class CompanyMapper {

    public static Company toEntity(CompanyRequestDTO dto, User user) {
         return Company.builder()
                 .user(user)
                 .companyName(dto.getCompanyName())    // REQUIRED
                .companyEmail(dto.getCompanyEmail())  // REQUIRED
                .companyWebsite(dto.getCompanyWebsite())
                .location(dto.getLocation())          // REQUIRED
                .description(dto.getDescription())
                .logoUrl(dto.getLogoUrl())
                .build();
    }

    public static CompanyResponseDTO toResponse(Company company) {
        return CompanyResponseDTO.builder()
                .id(company.getId())
                .companyName(company.getCompanyName())
                .companyId(company.getCompanyId())
                .companyEmail(company.getCompanyEmail())
                .companyWebsite(company.getCompanyWebsite())
                .location(company.getLocation())
                .description(company.getDescription())
                .logoUrl(company.getLogoUrl())
                .userId(company.getUser().getUserId())
                .build();
    }
}
