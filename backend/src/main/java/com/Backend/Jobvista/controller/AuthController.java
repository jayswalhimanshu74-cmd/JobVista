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

    private  final Logger log = LoggerFactory.getILoggerFactory().getLogger("log");

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register( @Valid  @RequestBody  UserRequestDTO requestDTO){
        UserResponseDTO user = authService.regiser(requestDTO);
        try{
            emailService.sendMail(
                    user.getEmail(),
                    EmailType.USER_REGISTERED,
                    Map.of("name", user.getName())
            );
        }catch (Exception e){
            log.warn("Email failed: {}", e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }



    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody LoginRequestDTO requestDTO,
                                                  HttpServletResponse response){

         TokenResponseDTO tokenResponseDTO = authService.login(requestDTO,response);

         try{
             UserResponseDTO user  = userService.findByEmail(requestDTO.getEmail());
            emailService.sendMail(
                    requestDTO.getEmail(),
                    EmailType.LOGIN_ALERT,
                    Map.of("name",user.getName())
            );
             }
             catch (Exception e) {
                 log.warn("Email failed: {}", e.getMessage());
             }
        return  ResponseEntity.ok(tokenResponseDTO);
    }


    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDTO> refresh(
            @CookieValue(name = "refreshToken") String refreshToken,
            HttpServletResponse response) {

        return ResponseEntity.ok(
                authService.refreshToken(refreshToken, response)
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            Date expiry = jwtService.extractExpiration(token);

            blackListedTokenService.blacklistToken(token, expiry);

            refreshTokenService.revokeToken(token);
        }

        return ResponseEntity.ok("Logged out successfully");
    }

}
