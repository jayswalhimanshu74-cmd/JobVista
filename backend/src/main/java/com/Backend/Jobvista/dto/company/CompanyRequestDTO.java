package com.Backend.Jobvista.dto.company;

import lombok.*;

import java.util.UUID;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyRequestDTO {

    private UUID userId;

    private String companyName;
    private String companyEmail;
    private String location;

    // OPTIONAL
    private String companyWebsite;
    private String description;
    private String logoUrl;
}