package com.Backend.Jobvista.service;

import com.Backend.Jobvista.dto.TokenResponseDTO;
import com.Backend.Jobvista.dto.user.UserRequestDTO;
import com.Backend.Jobvista.dto.user.UserResponseDTO;
import com.Backend.Jobvista.dto.login.LoginRequestDTO;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;


@Service
public interface AuthService {

    UserResponseDTO regiser (UserRequestDTO requestDTO);
     TokenResponseDTO login(LoginRequestDTO request, HttpServletResponse response);
    TokenResponseDTO refreshToken(String refreshToken,HttpServletResponse response);
    void logout(String refreshTokenValue);
}

