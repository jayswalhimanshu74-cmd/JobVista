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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class AuthServiceImplementation  implements AuthService {

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;

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
                 Instant.now().plusMillis(refreshExpiration)
           );
        ResponseCookie cookie = createRefreshTokenCookie(refreshToken.getToken(), refreshExpiration / 1000);

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return new TokenResponseDTO(accessToken,user.getRole());
    }

    @Override
    @Transactional
    public TokenResponseDTO refreshToken(String refreshTokenValue ,HttpServletResponse response) {

        RefreshToken refreshToken = refreshTokenService.verifyAndRotate(
                refreshTokenValue
        );

        User user = refreshToken.getUser();

        String newAccessToken = jwtService.generateAccessToken(user);

        ResponseCookie cookie = createRefreshTokenCookie(refreshToken.getToken(), 7 * 24 * 60 * 60);

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return new TokenResponseDTO(newAccessToken,user.getRole());

    }

    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenService.revokeToken(refreshTokenValue);
    }

    private ResponseCookie createRefreshTokenCookie(String token, long maxAgeSeconds) {
        jakarta.servlet.http.HttpServletRequest request = null;
        try {
            request = ((org.springframework.web.context.request.ServletRequestAttributes) 
                org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes())
                .getRequest();
        } catch (Exception e) {
            // Fallback
        }

        boolean isLocal = true;
        if (request != null) {
            String origin = request.getHeader("Origin");
            String referer = request.getHeader("Referer");
            String host = request.getServerName();
            
            if (origin != null && !origin.contains("localhost") && !origin.contains("127.0.0.1")) {
                isLocal = false;
            } else if (referer != null && !referer.contains("localhost") && !referer.contains("127.0.0.1")) {
                isLocal = false;
            } else if (host != null && !host.contains("localhost") && !host.contains("127.0.0.1")) {
                isLocal = false;
            }
        }

        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .path("/")
                .maxAge(maxAgeSeconds);

        if (isLocal) {
            cookieBuilder.secure(false)
                         .sameSite("Lax");
        } else {
            cookieBuilder.secure(true)
                         .sameSite("None");
        }

        return cookieBuilder.build();
    }

    @Override
    @Transactional
    public boolean verifyEmail(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        User user = userRepository.findByVerificationToken(token)
                .orElse(null);
        if (user == null) {
            return false;
        }
        user.setStatus(com.Backend.Jobvista.entity.Status.ACTIVE);
        user.setVerificationToken(null);
        userRepository.save(user);
        return true;
    }
}
