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
@Table(
        name = "recently_viewed_jobs",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "job_id"})
)
public class RecentlyViewedJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private UUID viewedId = UUID.randomUUID();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    private LocalDateTime viewedAt;

    @PrePersist
    public void onView() {
        this.viewedAt = LocalDateTime.now();
        this.viewedId = UUID.randomUUID();
    }
}