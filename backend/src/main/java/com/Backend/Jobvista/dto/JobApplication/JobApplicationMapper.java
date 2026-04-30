package com.Backend.Jobvista.dto.JobApplication;


import com.Backend.Jobvista.entity.JobApplication;

public class JobApplicationMapper {
    public static JobApplicationResponseDToO toResponse(JobApplication application) {

        String companyName="Confidential";
        if (application.getJob() != null &&
                application.getJob().getCompany() != null) {

            companyName = application.getJob()
                    .getCompany()
                    .getCompanyName();
        }
        return JobApplicationResponseDToO.builder()
                .applicationId(application.getJobApplicationId())
                .jobId(application.getJob() != null
                        ? application.getJob().getJobId()
                        : null)
                .jobTitle(application.getJob() != null
                        ? application.getJob().getTitle()
                        : null)
                .companyName(companyName)
                .jobSeekerName(application.getJobSeeker()
                        .getUser()
                        .getName())
                .status(application.getApplicationStatus())
                .appliedAt(application.getAppliedAt())
                .build();
    }
}
