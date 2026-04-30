package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.dto.Job.JobMapper;
import com.Backend.Jobvista.dto.Job.JobRequestDTO;
import com.Backend.Jobvista.dto.Job.JobResponseDTO;
import com.Backend.Jobvista.entity.*;
import com.Backend.Jobvista.repository.*;
import com.Backend.Jobvista.service.JobService;
import com.Backend.Jobvista.specification.JobSpecification;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@AllArgsConstructor
public class JobServiceImplementation implements JobService {


    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final JobSeekersRepository jobSeekersRepository;
    private final SavedJobRepository savedJobRepository;
    private final RecentlyViewedRepository recentlyViewedRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;


    public Page<JobResponseDTO> getAllJobs(int page, int size, String email) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("postedAt").descending());
        Page<Job> jobPage = jobRepository.findAll(pageable);

        // ✅ If no user, skip saved check
        if (email == null) {
            return jobPage.map(job -> {
                JobResponseDTO dto = JobMapper.toResponse(job);
                dto.setSaved(false);
                return dto;
            });
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return jobPage.map(job -> {
            JobResponseDTO dto = JobMapper.toResponse(job);
            dto.setSaved(savedJobRepository.existsByJobAndUser(job, user));
            return dto;
        });
    }

    @Override
    @Transactional
    @CacheEvict(value = "jobs", allEntries = true) // ✅ clear cache after update
    public JobResponseDTO updateJob(UUID jobId, String email, JobRequestDTO dto) {

        // 1. Get Job
        Job job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        //  2. Get User
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //  3. Get Company
        Company company = companyRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        //  4. Authorization check
        if (!job.getCompany().getId().equals(company.getId())) {
            throw new RuntimeException("You are not authorized to update this job");
        }

        //  5. Update fields (only if not null)
        if (dto.getTitle() != null) {
            job.setTitle(dto.getTitle());
        }

        if (dto.getDescription() != null) {
            job.setDescription(dto.getDescription());
        }

        if (dto.getLocation() != null) {
            job.setLocation(dto.getLocation());
        }

        if (dto.getSalaryOrStipend() != null) {
            job.setSalaryOrStipend(dto.getSalaryOrStipend());
        }

        if (dto.getRequiredSkills() != null) {
            job.setRequiredSkills(dto.getRequiredSkills());
        }

        if (dto.getExperienceRequired() != null) {
            job.setExperienceRequired(dto.getExperienceRequired());
        }

        if (dto.getJobType() != null) {
            job.setJobType(JobType.valueOf(dto.getJobType()));
        }

        if (dto.getEmploymentType() != null) {
            job.setEmploymentType(EmploymentType.valueOf(dto.getEmploymentType()));
        }

        if (dto.getLastDate() != null) {
            job.setLastDate(dto.getLastDate());
        }

        // ✅ 6. Save updated job
        Job updatedJob = jobRepository.save(job);

        // ✅ 7. Return response
        return JobMapper.toResponse(updatedJob);
    }

    @Override
    public JobResponseDTO getJobByJobId(UUID jobId, String email) {


            Job job = jobRepository.findByJobId(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 🔥 TRACK VIEW
            trackJobView(user, job);

            return JobMapper.toResponse(job);

    }

    @CacheEvict(value = "jobs", allEntries = true)
    @Override
    public void deleteJob(UUID jobId) {
        Job job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        jobRepository.delete(job);
    }

    @Override
    public Page<JobResponseDTO> getJobsByCompany(UUID companyId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Job> jobs = jobRepository.findByCompany_CompanyId(companyId, pageable);

        return jobs.map(job -> JobResponseDTO.builder()
                .id(job.getId())
                .jobId(job.getJobId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType())
                .salaryOrStipend(job.getSalaryOrStipend())
                .requiredSkills(job.getRequiredSkills())
                .experienceRequired(job.getExperienceRequired())
                .postedAt(job.getPostedAt())
                .lastDate(job.getLastDate())
                .companyName(job.getCompany().getCompanyName())
                .isSaved(false)
                .build());
    }

    public Page<JobResponseDTO> filterJobs(
            String keyword,
            String location,
            JobType jobType,
            UUID companyId,
            int page,
            int size,
            String sortBy
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());

        if (keyword != null && companyId != null) {
            return jobRepository.searchByCompanyAndKeyword(companyId, keyword, pageable)
                    .map(JobMapper::toResponse);
        }

        if (keyword != null) {
            return jobRepository.searchJobs(keyword, pageable)
                    .map(JobMapper::toResponse);
        }

        if (location != null && jobType != null) {
            return jobRepository.findByLocationIgnoreCaseAndJobType(location, jobType, pageable)
                    .map(JobMapper::toResponse);
        }

        if (location != null) {
            return jobRepository.findByLocationIgnoreCase(location, pageable)
                    .map(JobMapper::toResponse);
        }

        if (jobType != null) {
            return jobRepository.findByJobType(jobType, pageable)
                    .map(JobMapper::toResponse);
        }

        if (companyId != null) {
            return jobRepository.findByCompany_CompanyId(companyId, pageable)
                    .map(JobMapper::toResponse);
        }

        return jobRepository.findAll(pageable)
                .map(JobMapper::toResponse);
    }

    @Override
    public List<JobResponseDTO> getFeaturedJobs() {
        return jobRepository.findTop10ByOrderByIdDesc(PageRequest.of(0, 10))
                .stream()
                .map(job -> JobResponseDTO.builder()
                        .id(job.getId())
                        .isSaved(false)
                        .title(job.getTitle())
                        .companyName(job.getCompany().getCompanyName())
                        .location(job.getLocation())
                        .build())
                .toList();
    }

    @Override
    public Page<Job> searchJobs(String keyword, Pageable pageable) {
        return jobRepository
                .findByTitleContainingIgnoreCaseOrCompanyNameContainingIgnoreCaseOrLocationContainingIgnoreCase(
                        keyword,
                        keyword,
                        keyword,
                        pageable
                );
    }

    @Override
    public List<JobResponseDTO> getRecommendedJobs(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobSeeker jobSeeker = jobSeekersRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Create profile first"));

        String skills = jobSeeker.getSkills(); // assume comma separated
        String location = jobSeeker.getLocation();
        int experience = jobSeeker.getExperience();
        int skip = page * size;
        int FETCH_LIMIT = 200;

        String[] skillList = skills.toLowerCase().split(",");

        String primarySkill = skillList[0].trim();

        List<Job> jobs = jobRepository.findRelevantJobs(
                primarySkill,
                location,
                experience
        );

        return jobs.stream()
                .map(job -> {
                    int score = 0;


                    //Skill match
                    int skillScore = 0;
                    if (job.getDescription() != null && skills != null) {



                        for (String skill : skillList) {
                            if (job.getDescription().toLowerCase().contains(skill.trim())) {
                                skillScore += 2; // per skill match
                            }
                        }
                    }

                    score += skillScore;

                    if (job.getRequiredSkills() != null && skills != null) {

                        for (String skill : skillList) {
                            if (job.getRequiredSkills().toLowerCase().contains(skill.trim())) {
                                skillScore += 3; // higher weight than description
                            }
                        }
                    }
                    if (job.getTitle() != null && skills != null) {
                        for (String skill : skillList) {
                            if (job.getTitle().toLowerCase().contains(skill.trim())) {
                                score += 4;
                            }
                        }
                    }
                    // Location match
                    if (job.getLocation() != null &&
                            location != null &&
                            job.getLocation().equalsIgnoreCase(location)) {
                        score += 3;
                    }
                    if (job.getPostedAt() != null) {
                        if (job.getPostedAt().isAfter(LocalDateTime.now().minusDays(7))) {
                            score += 2;
                        }
                    }
                    // 🔹 Experience match (simple logic)
                    if ( job.getExperienceRequired() != null && job.getExperienceRequired() <= experience) {
                        score += 2;
                    }

                    return Map.entry(job, score);

                })
                .filter(entry->entry.getValue()>0)
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .skip(skip)
                .limit(size)
                .map(entry->JobMapper.toResponse(entry.getKey()))
                .toList();
    }


    @Cacheable(
            value = "jobs",
            key = "#keyword + '-' + #location + '-' + #minSalary + '-' + #maxSalary + '-' + #page + '-' + #size"
    )
    @Override
    public Page<JobResponseDTO> searchJobs(String keyword, String location, Integer minSalary, Integer maxSalary, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<Job> spec = Specification
                .where(JobSpecification.hasKeyword(keyword))
                .and(JobSpecification.hasLocation(location))
                .and(JobSpecification.hasSalary(minSalary, maxSalary));

        Page<Job> jobs =  jobRepository.findAll(spec, pageable);

        List<JobResponseDTO> dtoList = jobs.getContent()
                .stream()
                .map(JobMapper::toResponse)
                .toList();

        return new org.springframework.data.domain.PageImpl<>(
                dtoList,
                pageable,
                jobs.getTotalElements()
        );
    }

    @Transactional
    public Job saveJob(String title, String description, String lastDate, String companyName) {

        Company company = null;

        if (companyName != null && !companyName.isEmpty()) {
            company = companyRepository.findByCompanyName(companyName)
                    .orElseGet(() -> companyRepository.save(
                            Company.builder()
                                    .companyName(companyName)
                                    .build()
                    ));
        }

        Job job = Job.builder()
                .title(title)
                .description(description)
                .lastDate(LocalDateTime.parse(lastDate))
                .company(company) // ✅ may be null safely
                .build();

        return jobRepository.save(job);
    }

    // ✅ Convert Job → DTO (NO MORE NULL POINTER)
    public JobResponseDTO mapToResponse(Job job) {

        return JobResponseDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .lastDate(job.getLastDate())
                .companyName(
                        Optional.ofNullable(job.getCompany())
                                .map(Company::getCompanyName)
                                .orElse(null)
                )
                .isSaved(false).build();
    }

    // ✅ Get Job By ID
    @Transactional
    public JobResponseDTO getJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        return mapToResponse(job);
    }

    @CacheEvict(value = "jobs", allEntries = true)
    @Override
    public JobResponseDTO createJob(JobRequestDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Company company = companyRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Job job = JobMapper.toEntity(dto, company);
        Job savedJob = jobRepository.save(job);
        JobResponseDTO response = JobMapper.toResponse(savedJob);

        eventPublisher.publishEvent(new com.Backend.Jobvista.event.ApplicationEvent(
                null, null, response.getTitle(), null,
                com.Backend.Jobvista.event.ApplicationEvent.EventType.JOB_CREATED,
                response
        ));

        return response;
    }

    private void trackJobView(User user, Job job) {

        Optional<RecentlyViewedJob> existing =
                recentlyViewedRepository.findByUserAndJob(user, job);

        if (existing.isPresent()) {
            // ✅ Update timestamp (NO duplicate)
            RecentlyViewedJob viewed = existing.get();
            viewed.setViewedAt(LocalDateTime.now());
            recentlyViewedRepository.save(viewed);
        } else {
            // ✅ Create new entry
            RecentlyViewedJob newView = RecentlyViewedJob.builder()
                    .user(user)
                    .job(job)
                    .viewedAt(LocalDateTime.now())
                    .build();

            recentlyViewedRepository.save(newView);
        }
    }

    @Override
    public List<JobResponseDTO> getRecentJobs(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return recentlyViewedRepository
                .findTop10ByUserOrderByViewedAtDesc(user)
                .stream()
                .map(r -> JobMapper.toResponse(r.getJob()))
                .toList();
    }

    @Override
    public Page<JobResponseDTO> searchJobsPublic(String keyword, int page, int size, String email) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("postedAt").descending());
        Page<Job> jobPage = jobRepository.searchJobs(keyword, pageable);

        // If no user, skip saved check
        if (email == null) {
            return jobPage.map(job -> {
                JobResponseDTO dto = JobMapper.toResponse(job);
                dto.setSaved(false);
                return dto;
            });
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return jobPage.map(job -> {
                JobResponseDTO dto = JobMapper.toResponse(job);
                dto.setSaved(false);
                return dto;
            });
        }

        return jobPage.map(job -> {
            JobResponseDTO dto = JobMapper.toResponse(job);
            dto.setSaved(savedJobRepository.existsByJobAndUser(job, user));
            return dto;
        });
    }

}
