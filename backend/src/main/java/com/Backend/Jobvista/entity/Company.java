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
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, unique = true, updatable = false)
    private UUID companyId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String companyName;


    @Column(nullable = false,unique = true)
    private String companyEmail;

    private String companyWebsite;

    @Column(nullable = false)
    private String location;

    @Column(length = 1500)
    private String description;

    private String logoUrl;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    private java.util.List<Job> jobs;

    @PrePersist
    public void generateCompanyId() {
        if (companyId == null) {
            companyId = UUID.randomUUID();
        }
    }
}

