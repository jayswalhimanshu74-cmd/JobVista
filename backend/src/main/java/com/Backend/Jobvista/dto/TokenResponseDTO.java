package com.Backend.Jobvista.dto;


import com.Backend.Jobvista.entity.Role;
import lombok.*;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Builder
public class TokenResponseDTO {

    private String accessToken;
    private String refreshToken; // ✅ add this
    private Role role;

}
