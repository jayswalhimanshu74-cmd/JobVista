package com.Backend.Jobvista.repository;

import com.Backend.Jobvista.entity.Company;
import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.entity.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, Long> {

    @EntityGraph(attributePaths = {"company"})
    Optional<Job> findByJobId(UUID jobId);
    
    @EntityGraph(attributePaths = {"company"})
    Page<Job> findAll(Pageable pageable);
    boolean existsByExternalId(String externalId);
    // Filter by company
    @EntityGraph(attributePaths = {"company"})
    Page<Job> findByCompany_CompanyId(UUID companyId, Pageable pageable);

    // Filter by location (case-insensitive)
    @EntityGraph(attributePaths = {"company"})
    Page<Job> findByLocationIgnoreCase(String location, Pageable pageable);

    // Filter by job type
    @EntityGraph(attributePaths = {"company"})
    Page<Job> findByJobType(JobType jobType, Pageable pageable);

    // Filter by location AND job type
    @EntityGraph(attributePaths = {"company"})
    Page<Job> findByLocationIgnoreCaseAndJobType(String location, JobType jobType, Pageable pageable);

    // Keyword search (title, skills, description, company name)
    @Query("""
        SELECT j FROM Job j
        LEFT JOIN j.company c
        WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(c.companyName) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    @EntityGraph(attributePaths = {"company"})
    Page<Job> searchJobs(@Param("keyword") String keyword, Pageable pageable);

    // Optional: keyword + company
    @Query("""
        SELECT j FROM Job j
        WHERE j.company.companyId = :companyId
          AND (LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    @EntityGraph(attributePaths = {"company"})
    Page<Job> searchByCompanyAndKeyword(@Param("companyId") UUID companyId,
                                        @Param("keyword") String keyword,
                                        Pageable pageable);

    boolean existsByCompanyAndTitleAndLocation(Company company, String title, String location);

    Page<Job> findByTitleContainingIgnoreCaseOrCompanyNameContainingIgnoreCaseOrLocationContainingIgnoreCase(
            String title,
            String company,
            String location,
            Pageable pageable
    );

    // Optional (for search + company)
    Page<Job> findByCompanyIdAndTitleContainingIgnoreCase(
            Long companyId,
            String keyword,
            Pageable pageable
    );
    Page<Job> findTop10ByOrderByIdDesc(Pageable pageable);

    @Query("""
    SELECT j FROM Job j
    WHERE
    (
        LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :skill, '%'))
        OR LOWER(j.description) LIKE LOWER(CONCAT('%', :skill, '%'))
    )
    AND LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))
    AND j.experienceRequired <= :experience
""")
    @EntityGraph(attributePaths = {"company"})
    List<Job> findRelevantJobs(@Param("skill") String skill, @Param("location") String location, @Param("experience") int experience );

    @EntityGraph(attributePaths = {"company"})
    Page<Job> findAll(Specification<Job> spec, Pageable pageable);

    @Query("""
SELECT c.companyName, COUNT(j)
FROM Job j
JOIN j.company c
GROUP BY c.companyName
ORDER BY COUNT(j) DESC
""")
    List<Object[]> getTopCompanies();


    @EntityGraph(attributePaths = {"company"})
    List<Job> findTop5ByOrderByPostedAtDesc();
}






