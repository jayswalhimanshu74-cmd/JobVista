package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.entity.BlackListedToken;
import com.Backend.Jobvista.repository.BlackListedTokenRepository;
import com.Backend.Jobvista.service.BlackListedTokenService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;

@Service
@AllArgsConstructor
public class BlackListedTokenServiceImplementation implements BlackListedTokenService {

    private final BlackListedTokenRepository repository;

    @Override
    @org.springframework.cache.annotation.CacheEvict(value = "blacklist", key = "#token")
    public void blacklistToken(String token, Date expiryDate) {
        BlackListedToken bt = new BlackListedToken();
        bt.setToken(token);
        bt.setExpiryDate(expiryDate);

        repository.save(bt);

    }

    @Override
    @org.springframework.cache.annotation.Cacheable(value = "blacklist", key = "#token")
    public boolean isBlacklisted(String token) {
        return repository.existsByToken(token);
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 * * * *") // runs every hour
    @org.springframework.cache.annotation.CacheEvict(value = "blacklist", allEntries = true)
    public void cleanExpiredTokens() {
        repository.deleteByExpiryDateBefore(LocalDateTime.now());
        System.out.println("Expired tokens cleaned");
    }
}
