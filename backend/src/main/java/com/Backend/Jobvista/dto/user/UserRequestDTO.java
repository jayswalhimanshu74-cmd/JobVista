package com.Backend.Jobvista.dto.user;

import com.Backend.Jobvista.entity.Role;
import com.Backend.Jobvista.entity.Status;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRequestDTO {

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @Size(max = 20, message = "Mobile number must not exceed 20 characters")
    private String mobileNumber;

    private Role role;
    private Status status;

    @Size(max = 500, message = "Profile picture URL must not exceed 500 characters")
    private String profilePicture;

    @Size(max = 500, message = "Cover photo URL must not exceed 500 characters")
    private String coverPhoto;

}
