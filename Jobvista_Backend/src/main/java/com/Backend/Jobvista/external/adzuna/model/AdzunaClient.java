package com.Backend.Jobvista.external.adzuna.model;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class AdzunaClient {

    private final WebClient webClient;

    @Value("${adzuna.app-id}")
    private String appId;

    @Value("${adzuna.app-key}")
    private String appKey;

    public AdzunaResponse searchJobs(String keyword, int page) {

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/api/jobs/in/search/{page}")
                        .queryParam("app_id", appId)
                        .queryParam("app_key", appKey)
                        .queryParam("what", keyword)
                        .build(page))
                .retrieve()
                .bodyToMono(AdzunaResponse.class)
                .block();
    }
}
