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
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

@Component
@RequiredArgsConstructor
public class AdzunaClient {

    private final WebClient webClient;
    private static final Logger log = LoggerFactory.getLogger(AdzunaClient.class);

    @Value("${adzuna.app-id}")
    private String appId;

    @Value("${adzuna.app-key}")
    private String appKey;

    @Value("${adzuna.results-per-page:20}")
    private int resultsPerPage;

    @Value("${adzuna.live-search.timeout-seconds:8}")
    private int timeoutSeconds;

    @Value("${adzuna.live-search.max-calls-per-day:100}")
    private int maxCallsPerDay;

    private final AtomicInteger dailyCallCounter = new AtomicInteger(0);
    private final AtomicReference<LocalDate> currentUtcDay = new AtomicReference<>(LocalDate.now(ZoneOffset.UTC));

    private void resetDailyCounterIfNeeded() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate recordedDay = currentUtcDay.get();
        if (!today.equals(recordedDay)) {
            if (currentUtcDay.compareAndSet(recordedDay, today)) {
                dailyCallCounter.set(0);
            }
        }
    }

    public boolean isDailyCapReached() {
        resetDailyCounterIfNeeded();
        return dailyCallCounter.get() >= maxCallsPerDay;
    }

    public int incrementDailyCallCount() {
        resetDailyCounterIfNeeded();
        return dailyCallCounter.incrementAndGet();
    }

    public int getDailyCallCount() {
        resetDailyCounterIfNeeded();
        return dailyCallCounter.get();
    }

    public AdzunaResponse searchJobs(String keyword, int page) {
        if (isDailyCapReached()) {
            log.warn("Adzuna daily call cap reached ({}/day). Skipping API call for keyword '{}'",
                    maxCallsPerDay, keyword);
            return null;
        }

        try {
            int attempt = incrementDailyCallCount();
            log.info("Adzuna HTTP attempt #{} today for keyword: '{}'", attempt, keyword);

            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/api/jobs/in/search/{page}")
                            .queryParam("app_id", appId)
                            .queryParam("app_key", appKey)
                            .queryParam("what", keyword)
                            .queryParam("results_per_page", resultsPerPage)
                            .build(page))
                    .retrieve()
                    .bodyToMono(AdzunaResponse.class)
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .retryWhen(Retry.backoff(2, Duration.ofMillis(500))
                            .filter(throwable -> {
                                if (throwable instanceof WebClientResponseException wce) {
                                    int status = wce.getStatusCode().value();
                                    return status == 429 || (status >= 500 && status < 600);
                                }
                                return false;
                            })
                            .doBeforeRetry(retrySignal -> {
                                int retryAttempt = incrementDailyCallCount();
                                log.warn("Retrying Adzuna HTTP call (retry attempt #{} today, retry count {}) for keyword '{}'",
                                        retryAttempt, retrySignal.totalRetries() + 1, keyword);
                            }))
                    .block(Duration.ofSeconds(timeoutSeconds + 2));
        } catch (Exception e) {
            log.error("Failed to fetch jobs from Adzuna API for keyword '{}' (page {}): {}", keyword, page, e.getMessage());
            return null;
        }
    }
}
