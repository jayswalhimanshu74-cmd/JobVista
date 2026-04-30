package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.entity.User;
import com.Backend.Jobvista.repository.RefreshTokenRepository;
import com.Backend.Jobvista.security.RefreshToken;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public RefreshToken createOrUpdate(User user, Instant expiryDate) {

        RefreshToken refreshToken = refreshTokenRepository
                .findByUser(user)
                .orElse(null);

        if (refreshToken == null) {
            refreshToken = new RefreshToken();
            refreshToken.setUser(user);
        }

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(expiryDate);
        refreshToken.setRevoked(false);

        return refreshTokenRepository.save(refreshToken);
    }
    // 7 days (adjust if needed)
//    private static final long REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60;
//
//    public RefreshToken createRefreshToken(User user) {
//
//        RefreshToken refreshToken = RefreshToken.builder()
//                .user(user)
//                .token(UUID.randomUUID().toString())
//                .expiryDate(Instant.now().plusSeconds(REFRESH_TOKEN_VALIDITY))
//                .revoked(false)
//                .build();
//
//        return refreshTokenRepository.save(refreshToken);
//    }

//    public void revokeAllUserTokens(User user) {
//        refreshTokenRepository.revokeAllByUser(user);
//    }
    @Transactional
    public RefreshToken verifyAndRotate(String tokenValue) {

        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(tokenValue)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new RuntimeException("Refresh token revoked");
        }

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        // Rotate token (important for security)
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plus(7, ChronoUnit.DAYS));

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public void revokeToken(String tokenValue) {

        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(tokenValue)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }

}
