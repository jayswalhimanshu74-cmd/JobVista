package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.dto.TokenResponseDTO;
import com.Backend.Jobvista.dto.user.UserRequestDTO;
import com.Backend.Jobvista.dto.user.UserResponseDTO;
import com.Backend.Jobvista.dto.login.LoginRequestDTO;
import com.Backend.Jobvista.entity.Role;
import com.Backend.Jobvista.entity.User;
import com.Backend.Jobvista.repository.UserRepository;
import com.Backend.Jobvista.security.JwtService;
import com.Backend.Jobvista.security.RefreshToken;
import com.Backend.Jobvista.service.AuthService;
import com.Backend.Jobvista.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@AllArgsConstructor
public class AuthServiceImplementation  implements AuthService {



    private AuthenticationManager authenticationManager;
    private UserRepository userRepository;
    private JwtService jwtService;

    private RefreshTokenService refreshTokenService;


    private UserService userService;

    @Override
    public UserResponseDTO regiser(UserRequestDTO requestDTO) {

        if (requestDTO.getRole() == Role.ADMIN) {
            throw new RuntimeException("Admin registration not allowed");
        }

        return userService.registerUser(requestDTO);
    }

    @Override
    @Transactional
    public TokenResponseDTO login(LoginRequestDTO requestDTO, HttpServletResponse response) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        requestDTO.getEmail(), requestDTO.getPassword()
                )
        );

        User user = userRepository.findByEmail(requestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.createOrUpdate(
                user,
                Instant.now().plus(7, ChronoUnit.DAYS)
        );
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                .httpOnly(true)
                .secure(false)   // false if testing locally without https
                .path("/")
                .sameSite("Lax")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return new TokenResponseDTO(accessToken,refreshToken.getToken(),user.getRole());
    }

    @Override
    @Transactional
    public TokenResponseDTO refreshToken(String refreshTokenValue ,HttpServletResponse response) {

        RefreshToken refreshToken = refreshTokenService.verifyAndRotate(
                refreshTokenValue
        );

        User user = refreshToken.getUser();

        String newAccessToken = jwtService.generateAccessToken(user);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return new TokenResponseDTO(newAccessToken,refreshToken.getToken(),user.getRole());

    }

    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenService.revokeToken(refreshTokenValue);
    }

}
