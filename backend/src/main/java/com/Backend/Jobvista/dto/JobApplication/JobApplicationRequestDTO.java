package com.Backend.Jobvista.dto.JobApplication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class JobApplicationRequestDTO {
    private UUID jobId;
    private UUID jobSeekerId;
}
