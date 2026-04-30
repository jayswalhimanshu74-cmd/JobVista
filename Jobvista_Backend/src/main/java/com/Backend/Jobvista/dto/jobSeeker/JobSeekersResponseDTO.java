package com.Backend.Jobvista.dto.jobSeeker;

import lombok.*;

import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@Builder
@Data
@NoArgsConstructor
public class JobSeekersResponseDTO {


    private UUID jobSeekerId;
    private UUID userId;
    private String skills;
    private Integer experience;
    private String education;
    private String resumeUrl;
    private String location;
    private String profileSummary;

}
