package com.Backend.Jobvista.dto.Job;

import com.Backend.Jobvista.entity.EmploymentType;
import com.Backend.Jobvista.entity.JobType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class JobResponseDTO {

    private Long id;
    private UUID jobId;
    private String title;
    private String description;
    private String source;
    private JobType jobType;
    private EmploymentType employmentType;
    private String location;
    private String salaryOrStipend;
    private String requiredSkills;
    private String redirectUrl;
    private Integer experienceRequired;
    private  boolean isSaved;
    private String companyName;
    private LocalDateTime postedAt;
    private LocalDateTime lastDate;
}