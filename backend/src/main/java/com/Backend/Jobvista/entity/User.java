package com.Backend.Jobvista.entity;

    import com.Backend.Jobvista.security.RefreshToken;
    import jakarta.persistence.*;
    import jakarta.validation.constraints.Email;
    import jakarta.validation.constraints.NotBlank;
    import jakarta.validation.constraints.Size;
    import lombok.*;
    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import java.time.Instant;
    import lombok.Builder;
    import java.time.LocalDateTime;
    import java.util.Collection;
    import java.util.List;
    import java.util.UUID;
    import com.Backend.Jobvista.entity.Role;
    import com.fasterxml.jackson.annotation.JsonIgnore;

    @Entity
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    @Table(name = "users")
    public class User {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, unique = true, updatable = false)
        private UUID userId;

        @Column( nullable = false)
        private String name;

        @Column(unique = true, nullable = false)
        @NotBlank
        @Email
        private String email;

        @Column( nullable = false)
        @NotBlank
        @Size(min = 8)
        @JsonIgnore
        private String password;

        @Column( nullable = false)
        private String mobileNumber;

        @Enumerated(EnumType.STRING)
        private  Role role;

        @Enumerated(EnumType.STRING)
        private Status status;

        
        @Builder.Default
        private LocalDateTime createdAt= LocalDateTime.now();
        @Builder.Default
        private LocalDateTime updatedAt = LocalDateTime.now();

        private String profilePicture;
        private String coverPhoto;

        @PrePersist
        public void onCreate() {
            LocalDateTime time = LocalDateTime.now();
               if(createdAt==null) createdAt =time;
               updatedAt=time;

            if (userId == null) {
                userId = UUID.randomUUID();
            }

            this.status = Status.ACTIVE;
        }
        @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
        @JsonIgnore
        private RefreshToken refreshToken;

        @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
        @JsonIgnore
        private JobSeeker jobSeeker;

        @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
        @JsonIgnore
        private Company company;

        @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
        @JsonIgnore
        private List<SavedJob> savedJobs;


        public Collection<? extends GrantedAuthority> getAuthorities() {
            return List.of(
                    new SimpleGrantedAuthority("ROLE_" + getRole().name())
            );
        }
    }

