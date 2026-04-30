package com.Backend.Jobvista.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSeeker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true,updatable = false)
    private UUID jobSeekerId;
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false , unique = true)
    private User user;

    private String skills;

    private Integer experience;

    private String education;


    private String resumeUrl;

    private String location;

    @Column(length = 1000)
    private String profileSummary;

    @OneToMany(mappedBy = "jobSeeker", cascade = CascadeType.ALL)
    private java.util.List<JobApplication> applications;

    @PrePersist
    public void onCreate(){
        if(jobSeekerId==null)
            jobSeekerId = UUID.randomUUID();
    }
}
