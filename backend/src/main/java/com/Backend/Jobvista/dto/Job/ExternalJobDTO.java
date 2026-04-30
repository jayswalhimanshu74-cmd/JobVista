package com.Backend.Jobvista.dto.Job;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExternalJobDTO {

    private String id;
    private UUID jobId;
    private String title;
    private String description;
    private String companyName;
    private String location;
    private String salaryMin;
    private String salaryMax;
    private String redirectUrl;
}
