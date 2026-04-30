package com.Backend.Jobvista.dto.jobSeeker;

import jakarta.validation.constraints.NotBlank;
import lombok.*;


@Setter
@Getter
@AllArgsConstructor
@Builder
@Data
@NoArgsConstructor
public class JobSeekerRequestDTO {

    private Long id;

    @NotBlank
    private String skills;
    private Integer experience;
    @NotBlank
    private String education;

    private String resumeUrl;
    private String location;
    private String profileSummary;
}
