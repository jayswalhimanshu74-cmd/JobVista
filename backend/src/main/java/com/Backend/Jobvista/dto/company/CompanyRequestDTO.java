package com.Backend.Jobvista.dto.company;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
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

    @Size(max = 150, message = "Company name must not exceed 150 characters")
    private String companyName;

    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Company email must not exceed 150 characters")
    private String companyEmail;

    @Size(max = 150, message = "Location must not exceed 150 characters")
    private String location;

    // OPTIONAL
    @Size(max = 255, message = "Website URL must not exceed 255 characters")
    private String companyWebsite;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;
}