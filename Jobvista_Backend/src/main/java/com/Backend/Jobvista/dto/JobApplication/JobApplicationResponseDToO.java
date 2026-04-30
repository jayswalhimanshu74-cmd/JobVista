package com.Backend.Jobvista.dto.JobApplication;

import com.Backend.Jobvista.entity.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;


@Data
@Getter
@Setter
@AllArgsConstructor
@Builder
public class JobApplicationResponseDToO {
    private UUID applicationId;

    private UUID jobId;
    private String jobTitle;

    private String companyName;

    private String jobSeekerName;

    private ApplicationStatus status;

    private LocalDateTime appliedAt;
}
