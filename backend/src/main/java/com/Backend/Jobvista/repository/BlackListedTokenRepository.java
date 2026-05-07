package com.Backend.Jobvista.repository;

import com.Backend.Jobvista.entity.BlackListedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

public  interface BlackListedTokenRepository extends JpaRepository<BlackListedToken, UUID> {

    boolean existsByToken(String token);

    @Modifying
    @Query("DELETE FROM BlackListedToken b WHERE b.expiryDate < :time")
    void deleteByExpiryDateBefore(LocalDateTime time);
}
