package com.Backend.Jobvista.dto.user;

import com.Backend.Jobvista.entity.Role;
import com.Backend.Jobvista.entity.Status;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRequestDTO {

    private String name;
    private String email;
    private String password;
    private String mobileNumber;
    private Role role;
    private Status status;

}
