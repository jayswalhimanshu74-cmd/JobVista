package com.Backend.Jobvista.external.adzuna.model;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class AdzunaClient {

    private final WebClient webClient;
    private static final Logger log = LoggerFactory.getLogger(AdzunaClient.class);

    @Value("${adzuna.app-id}")
    private String appId;

    @Value("${adzuna.app-key}")
    private String appKey;

    public AdzunaResponse searchJobs(String keyword, int page) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/api/jobs/in/search/{page}")
                            .queryParam("app_id", appId)
                            .queryParam("app_key", appKey)
                            .queryParam("what", keyword)
                            .build(page))
                    .retrieve()
                    .bodyToMono(AdzunaResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .retryWhen(Retry.backoff(2, Duration.ofMillis(500))
                            .filter(throwable -> {
                                if (throwable instanceof WebClientResponseException wce) {
                                    int status = wce.getStatusCode().value();
                                    return status == 429 || (status >= 500 && status < 600);
                                }
                                return false;
                            }))
                    .block(Duration.ofSeconds(12));
        } catch (Exception e) {
            log.error("Failed to fetch jobs from Adzuna API for keyword '{}' (page {}): {}", keyword, page, e.getMessage());
            return null;
        }
    }
}
