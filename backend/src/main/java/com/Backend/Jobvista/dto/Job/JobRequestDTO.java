package com.Backend.Jobvista.dto.Job;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class JobRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @Size(max = 50, message = "Job type must not exceed 50 characters")
    private String jobType;

    @Size(max = 50, message = "Employment type must not exceed 50 characters")
    private String employmentType;

    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @Size(max = 100, message = "Salary or stipend must not exceed 100 characters")
    private String salaryOrStipend;

    @Size(max = 500, message = "Required skills must not exceed 500 characters")
    private String requiredSkills;

    @Min(value = 0, message = "Experience required cannot be negative")
    private Integer experienceRequired;

    private LocalDateTime lastDate;

    // 🔴 REQUIRED to assign job to company
    private UUID companyId;//important: not Company entity
}