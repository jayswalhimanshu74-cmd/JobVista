package com.Backend.Jobvista.repository;

import com.Backend.Jobvista.entity.Role;
import com.Backend.Jobvista.entity.Status;
import com.Backend.Jobvista.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveAndFindByEmail() {
        User user = User.builder()
                .userId(UUID.randomUUID())
                .name("Alice")
                .email("alice@example.com")
                .password("securepassword123")
                .mobileNumber("1234567890")
                .role(Role.USER)
                .status(Status.ACTIVE)
                .build();

        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("alice@example.com");
        assertTrue(found.isPresent());
        assertEquals("Alice", found.get().getName());
    }

    @Test
    void testFindByVerificationToken() {
        User user = User.builder()
                .userId(UUID.randomUUID())
                .name("Bob")
                .email("bob@example.com")
                .password("securepassword123")
                .mobileNumber("0987654321")
                .role(Role.USER)
                .status(Status.PENDING)
                .verificationToken("token-xyz")
                .build();

        userRepository.save(user);

        Optional<User> found = userRepository.findByVerificationToken("token-xyz");
        assertTrue(found.isPresent());
        assertEquals("bob@example.com", found.get().getEmail());
    }
}
