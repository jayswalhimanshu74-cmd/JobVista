package com.Backend.Jobvista.dto.Job;


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

    private String title;
    private String description;
    private String jobType;
    private String employmentType;
    private String location;
    private String salaryOrStipend;
    private String requiredSkills;
    private  Integer experienceRequired;

    private LocalDateTime lastDate;

    // 🔴 REQUIRED to assign job to company
    private UUID companyId;//important: not Company entity
}