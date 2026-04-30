package com.Backend.Jobvista.dto.Job;
import com.Backend.Jobvista.entity.Company;
import com.Backend.Jobvista.entity.EmploymentType;
import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.entity.JobType;

public class JobMapper {

    public static Job toEntity(JobRequestDTO dto, Company company) {
        return Job.builder() .
                title(dto.getTitle())
                .description(dto.getDescription())
                .jobType(JobType.valueOf(dto.getJobType()))
                .employmentType(EmploymentType.valueOf(dto.getEmploymentType()))
                .location(dto.getLocation())
                .salaryOrStipend(dto.getSalaryOrStipend())
                .requiredSkills(dto.getRequiredSkills())
                .experienceRequired(dto.getExperienceRequired())
                .lastDate(dto.getLastDate())
                .company(company) // ✅ FK assigned here
                .build();
    }

    public static JobResponseDTO toResponse(Job job) {
        return JobResponseDTO.builder()
                .id(job.getId())
                .jobId(job.getJobId())
                .title(job.getTitle())
                .description(job.getDescription())
                .jobType(job.getJobType())
                .employmentType(job.getEmploymentType())
                .location(job.getLocation())
                .salaryOrStipend(job.getSalaryOrStipend())
                .requiredSkills(job.getRequiredSkills())
                .experienceRequired(job.getExperienceRequired())
                .companyName(
                        job.getCompany() != null ? job.getCompany().getCompanyName() : "Unknown"
                )
                .postedAt(job.getPostedAt())
                .lastDate(job.getLastDate())
                .isSaved(false)
                .build();
    }
}