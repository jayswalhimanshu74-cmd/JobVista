package com.Backend.Jobvista.dto.jobSeeker;

import com.Backend.Jobvista.entity.JobSeeker;
import com.Backend.Jobvista.entity.User;

public class JobSeekerMapper {

    public static JobSeeker toEntity(JobSeekerRequestDTO dto, User user) {
        return JobSeeker.builder()
                .user(user)
                .skills(dto.getSkills())
                .experience(dto.getExperience())
                .education(dto.getEducation())
                .resumeUrl(dto.getResumeUrl())
                .location(dto.getLocation())
                .profileSummary(dto.getProfileSummary())
                .build();
    }

    public static JobSeekersResponseDTO toResponse(JobSeeker seeker, User user) {

        return JobSeekersResponseDTO.builder()
                .jobSeekerId(seeker.getJobSeekerId(
                ))
                .userId(user.getUserId())
                .skills(seeker.getSkills())
                .experience(seeker.getExperience())
                .education(seeker.getEducation())
                .resumeUrl(seeker.getResumeUrl())
                .location(seeker.getLocation())
                .profileSummary(seeker.getProfileSummary())
                .build();
    }
}
