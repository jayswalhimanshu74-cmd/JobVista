package com.Backend.Jobvista.repository;

import com.Backend.Jobvista.entity.User;
import com.Backend.Jobvista.security.RefreshToken;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Long> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUser(User user);


    void deleteByUser(User user);

    @Modifying
    @Transactional
    @Query("""
        UPDATE RefreshToken r
        SET r.revoked = true
        WHERE r.user = :user
    """)
    void revokeAllByUser(User user);
}
