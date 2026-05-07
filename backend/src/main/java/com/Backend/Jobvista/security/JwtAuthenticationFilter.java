package com.Backend.Jobvista.security;

import com.Backend.Jobvista.service.BlackListedTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@AllArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final BlackListedTokenService blackListedTokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        if (path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-ui") ||
                path.equals("/swagger-ui.html")) {

            filterChain.doFilter(request, response);
            return;
        }
        // ✅ Skip authentication for auth and websocket endpoints
        if (path.startsWith("/api/v1/auth") || path.startsWith("/ws")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (blackListedTokenService.isBlacklisted(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Token is blacklisted\", \"status\": 401}");
            return;
        }

        try {
            String email = jwtUtil.extractUsername(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // ✅ OPTIMIZATION: Trust the token and extract role directly from claims
                // This avoids a database call (loadUserByUsername) on EVERY single request.
                String role = jwtUtil.extractRole(token);

                if (role != null) {
                    UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                            email,
                            "", // Password not needed for authenticated context
                            java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role))
                    );

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    System.out.println("✅ AUTH SET FROM JWT (No DB hit): " + email);
                }
            }
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            // ✅ Return 401 → frontend axios interceptor catches this
            // → calls /auth/refresh → gets new token → retries original request
            System.out.println("⚠️ Token expired: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Access token has expired\", \"status\": 401, \"code\": \"TOKEN_EXPIRED\"}");
            return; // ✅ stop here, don't continue filter chain

        } catch (io.jsonwebtoken.JwtException e) {
            // ✅ Invalid/malformed token → also 401
            System.out.println("⚠️ Invalid token: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + e.getMessage() + "\", \"status\": 401}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
