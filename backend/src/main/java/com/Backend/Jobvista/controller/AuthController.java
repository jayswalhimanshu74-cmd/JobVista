package com.Backend.Jobvista.controller;

import com.Backend.Jobvista.dto.TokenResponseDTO;
import com.Backend.Jobvista.dto.user.UserRequestDTO;
import com.Backend.Jobvista.dto.user.UserResponseDTO;
import com.Backend.Jobvista.dto.login.LoginRequestDTO;
import com.Backend.Jobvista.entity.EmailType;

import com.Backend.Jobvista.security.JwtService;

import com.Backend.Jobvista.service.AuthService;
import com.Backend.Jobvista.service.BlackListedTokenService;
import com.Backend.Jobvista.service.UserService;
import com.Backend.Jobvista.service.impl.RefreshTokenService;
import com.Backend.Jobvista.utills.EmailService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@AllArgsConstructor
public class AuthController {

    private AuthService authService;
    private UserService userService;
    private EmailService emailService;
    private JwtService jwtService;
    private BlackListedTokenService blackListedTokenService;
    private RefreshTokenService refreshTokenService;

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserRequestDTO requestDTO) {
        UserResponseDTO user = authService.regiser(requestDTO);
        try {
            String baseUrl = org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
            String verificationLink = baseUrl + "/api/v1/auth/verify?token=" + user.getVerificationToken();
            
            emailService.sendMail(
                    user.getEmail(),
                    EmailType.EMAIL_VERIFICATION,
                    Map.of(
                        "name", user.getName(),
                        "verificationLink", verificationLink
                    ));
        } catch (Exception e) {
            log.warn("Verification email failed: {}", e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody LoginRequestDTO requestDTO,
            HttpServletResponse response) {

        TokenResponseDTO tokenResponseDTO = authService.login(requestDTO, response);

        try {
            UserResponseDTO user = userService.findByEmail(requestDTO.getEmail());
            emailService.sendMail(
                    requestDTO.getEmail(),
                    EmailType.LOGIN_ALERT,
                    Map.of("name", user.getName()));
        } catch (Exception e) {
            log.warn("Email failed: {}", e.getMessage());
        }
        return ResponseEntity.ok(tokenResponseDTO);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDTO> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(
                authService.refreshToken(refreshToken, response));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                Date expiry = jwtService.extractExpiration(token);
                blackListedTokenService.blacklistToken(token, expiry);

                String email = jwtService.extractUsername(token); // Extract directly from token
                if (email != null) {
                    refreshTokenService.revokeByUserEmail(email);
                }
            } catch (Exception e) {
                log.warn("Logout cleanup partially failed: {}", e.getMessage());
            }
        }

        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        boolean verified = authService.verifyEmail(token);
        if (verified) {
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.TEXT_HTML)
                    .body("<div style='text-align:center; margin-top: 100px; font-family: sans-serif;'>" +
                            "<h1 style='color: #10b981;'>✅ Email Verified Successfully!</h1>" +
                            "<p style='color: #4b5563; font-size: 18px;'>Your JobVista account is now active. You can close this page and log in.</p>" +
                            "</div>");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(org.springframework.http.MediaType.TEXT_HTML)
                    .body("<div style='text-align:center; margin-top: 100px; font-family: sans-serif;'>" +
                            "<h1 style='color: #ef4444;'>❌ Verification Failed</h1>" +
                            "<p style='color: #4b5563; font-size: 18px;'>The verification link is invalid, expired, or has already been used.</p>" +
                            "</div>");
        }
    }

}
