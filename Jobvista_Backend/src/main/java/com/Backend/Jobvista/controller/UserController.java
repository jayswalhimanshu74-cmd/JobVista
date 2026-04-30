package com.Backend.Jobvista.controller;


import com.Backend.Jobvista.config.SecurityUtill;
import com.Backend.Jobvista.dto.user.UserRequestDTO;
import com.Backend.Jobvista.dto.user.UserResponseDTO;
import com.Backend.Jobvista.exception.UserNotFoundException;
import com.Backend.Jobvista.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final SecurityUtill securityUtil;


    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDTO> getMyProfile()
            throws UserNotFoundException {

        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        System.out.println("AUTH: " + auth);

        String email = securityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDTO> updateMyProfile(
            @RequestBody UserRequestDTO userRequestDTO)
            throws UserNotFoundException {

        String email = securityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(
                userService.updateUser(email, userRequestDTO)
        );
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deleteMyAccount()
            throws UserNotFoundException {

        String email = securityUtil.getCurrentUserEmail();
        userService.deleteUserByEmail(email);
        return ResponseEntity.ok("User deleted successfully");
    }

    // =========================
    // ADMIN / INTERNAL APIs
    // (keep but secure later)
    // =========================

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers()
            throws UserNotFoundException {

        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDTO> getUserById(
            @PathVariable Long id)
            throws UserNotFoundException {

        return ResponseEntity.ok(userService.getUserById(id));
    }
}

