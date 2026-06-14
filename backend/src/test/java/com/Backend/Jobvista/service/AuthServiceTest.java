package com.Backend.Jobvista.service;

import com.Backend.Jobvista.dto.user.UserRequestDTO;
import com.Backend.Jobvista.dto.user.UserResponseDTO;
import com.Backend.Jobvista.entity.Role;
import com.Backend.Jobvista.entity.Status;
import com.Backend.Jobvista.entity.User;
import com.Backend.Jobvista.repository.UserRepository;
import com.Backend.Jobvista.service.impl.AuthServiceImplementation;
import com.Backend.Jobvista.service.impl.UserServiceImplementation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserServiceImplementation userService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthServiceImplementation authService;

    private UserRequestDTO requestDTO;
    private UserResponseDTO responseDTO;
    private User user;

    @BeforeEach
    void setUp() {
        requestDTO = new UserRequestDTO();
        requestDTO.setEmail("test@example.com");
        requestDTO.setName("Test User");
        requestDTO.setRole(Role.USER);

        responseDTO = new UserResponseDTO();
        responseDTO.setEmail("test@example.com");
        responseDTO.setName("Test User");
        responseDTO.setRole(Role.USER);
        responseDTO.setVerificationToken("test-token");

        user = new User();
        user.setEmail("test@example.com");
        user.setName("Test User");
        user.setRole(Role.USER);
        user.setStatus(Status.PENDING);
        user.setVerificationToken("test-token");
    }

    @Test
    void testRegister_Success() {
        when(userService.registerUser(any(UserRequestDTO.class))).thenReturn(responseDTO);

        UserResponseDTO result = authService.regiser(requestDTO);

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(userService, times(1)).registerUser(requestDTO);
    }

    @Test
    void testRegister_AdminNotAllowed() {
        requestDTO.setRole(Role.ADMIN);

        assertThrows(RuntimeException.class, () -> {
            authService.regiser(requestDTO);
        });

        verify(userService, never()).registerUser(any());
    }

    @Test
    void testVerifyEmail_Success() {
        when(userRepository.findByVerificationToken("test-token")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        boolean verified = authService.verifyEmail("test-token");

        assertTrue(verified);
        assertEquals(Status.ACTIVE, user.getStatus());
        assertNull(user.getVerificationToken());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testVerifyEmail_InvalidToken() {
        when(userRepository.findByVerificationToken("invalid-token")).thenReturn(Optional.empty());

        boolean verified = authService.verifyEmail("invalid-token");

        assertFalse(verified);
        verify(userRepository, never()).save(any());
    }
}
