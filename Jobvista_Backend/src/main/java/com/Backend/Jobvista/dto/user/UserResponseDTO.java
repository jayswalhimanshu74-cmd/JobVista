package com.Backend.Jobvista.dto.user;

import com.Backend.Jobvista.entity.Role;
import com.Backend.Jobvista.entity.Status;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDTO {

    private Long id;
    private UUID userId;
    private String name;
    private String email;
    private String  mobileNumber;
    private Role role;
    private LocalDateTime createdAt;
    private String password;
    private LocalDateTime updatedAt;
    private Status status;

    // getters & setters
}