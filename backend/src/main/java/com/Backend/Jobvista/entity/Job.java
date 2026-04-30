package com.Backend.Jobvista.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private UUID jobId;

    @Column(updatable = false,unique = true)
    private String title;


    private String externalId;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    private EmploymentType employmentType;

    private String location;

    private String salaryOrStipend;

    private String source;
    @Column(nullable = false)
    private String requiredSkills;

    private Integer experienceRequired;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_Id",nullable = false)
    private Company company;

    private String companyName;

    private LocalDateTime postedAt;
    private  String redirectUrl;

    private LocalDateTime lastDate;

    @PrePersist
    public void onCreate() {

        if (jobId == null) {
            jobId = UUID.randomUUID();
        }

        if (postedAt == null) {
            postedAt = LocalDateTime.now();
        }
    }
}