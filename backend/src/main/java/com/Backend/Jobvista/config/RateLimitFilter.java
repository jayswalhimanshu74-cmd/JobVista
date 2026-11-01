package com.Backend.Jobvista.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // One bucket per IP address for auth endpoints (10 req/min)
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Separate bucket per IP address for search endpoints (30 req/min)
    private final Map<String, Bucket> searchBuckets = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        // Allow 10 requests per minute per IP
        Bandwidth limit = Bandwidth.classic(10, Refill.greedy(10, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket getBucket(String ip) {
        return buckets.computeIfAbsent(ip, k -> createNewBucket());
    }

    private Bucket createSearchBucket() {
        // Allow 30 requests per minute per IP
        Bandwidth limit = Bandwidth.classic(30, Refill.greedy(30, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket getSearchBucket(String ip) {
        return searchBuckets.computeIfAbsent(ip, k -> createSearchBucket());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only rate limit auth endpoints
        if (path.startsWith("/api/v1/auth/login") ||
            path.startsWith("/api/v1/auth/register")) {

            String ip = getClientIp(request);
            Bucket bucket = getBucket(ip);

            if (!bucket.tryConsume(1)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write(
                    "{\"error\":\"Too many requests\",\"message\":\"Please wait before trying again\",\"status\":429}"
                );
                return;
            }
        }

        // Rate limit search endpoints (30 req/min)
        if (path.startsWith("/api/v1/jobs/search") ||
            path.startsWith("/api/v1/job/search")) {

            String ip = getClientIp(request);
            Bucket bucket = getSearchBucket(ip);

            if (!bucket.tryConsume(1)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write(
                    "{\"error\":\"Too many requests\",\"message\":\"Please wait before trying again\",\"status\":429}"
                );
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
