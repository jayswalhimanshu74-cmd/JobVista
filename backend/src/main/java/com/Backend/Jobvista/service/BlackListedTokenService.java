package com.Backend.Jobvista.service;

import org.springframework.stereotype.Service;

import java.util.Date;


@Service
public interface BlackListedTokenService {

    void blacklistToken(String token, Date expiryDate);

    boolean isBlacklisted(String token);

    void cleanExpiredTokens();

}
