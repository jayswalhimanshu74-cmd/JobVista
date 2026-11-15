package com.Backend.Jobvista.dto.jobSeeker;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@Builder
@Data
@NoArgsConstructor
public class JobSeekerRequestDTO {

    private Long id;

    @Size(max = 500, message = "Skills must not exceed 500 characters")
    private String skills;

    @Min(value = 0, message = "Experience cannot be negative")
    private Integer experience;

    @Size(max = 255, message = "Education must not exceed 255 characters")
    private String education;

    @Size(max = 255, message = "Resume URL must not exceed 255 characters")
    private String resumeUrl;

    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @Size(max = 2000, message = "Profile summary must not exceed 2000 characters")
    private String profileSummary;
}
