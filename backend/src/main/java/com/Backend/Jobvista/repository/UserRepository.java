package com.Backend.Jobvista.repository;

import com.Backend.Jobvista.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User,Long> {


    Optional<User> findByEmail(String email);

    Optional<User> findByUserId(UUID userId);

    boolean existsByEmail(String email);

    boolean existsByUserId(UUID userId);

    List<User> findTop5ByOrderByCreatedAtDesc();

    void deleteByEmail(String email);
}
