package com.Backend.Jobvista.dto.company;


import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class CompanyResponseDTO {

    private Long id;
    private UUID companyId;

    private String companyName;
    private String companyEmail;
    private String companyWebsite;
    private String location;
    private String description;
    private String logoUrl;

    private UUID userId;

}
