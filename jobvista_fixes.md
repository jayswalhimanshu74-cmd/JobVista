# JobVista Codebase: Comprehensive Fixes & Solutions

This document provides a complete guide with actionable solutions and code changes required to address the identified critical bugs, security risks, architecture gaps, and industry-level improvements in the JobVista application.

---

## 1. Critical Bugs

### 1.1 Secrets committed to Git
**Problem:** Real API keys and passwords are hardcoded in `backend/.env` and `application.properties` and are committed to the repository.
**Solution:**
1. Move all sensitive values (DB passwords, Gmail app passwords, Adzuna credentials, JWT secrets) into a `.env` file.
2. Add `.env` to `.gitignore` so it is not tracked by Git.
3. Update `application.properties` to read these values dynamically:
```properties
spring.datasource.password=${DB_PASSWORD}
spring.mail.password=${GMAIL_APP_PASSWORD}
jwt.secret=${JWT_SECRET_KEY}
adzuna.app.id=${ADZUNA_APP_ID}
adzuna.app.key=${ADZUNA_APP_KEY}
```
4. **Critical:** Rotate all exposed secrets immediately as they are compromised in Git history. Use a tool like BFG Repo-Cleaner to strip `.env` and `application.properties` from Git history.

### 1.2 Admin seeder + DataInitializer conflict
**Problem:** Both `AdminSeeder` and `DataInitializer` attempt to create `admin@jobvista.com`, causing duplicate-email constraint violations on fresh startup.
**Solution:**
1. Check your codebase for `DataInitializer`. If it's no longer needed, remove it.
2. Modify `AdminSeeder` to check if the admin exists before creating:
```java
@Component
public class AdminSeeder implements CommandLineRunner {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@jobvista.com")) {
            User admin = new User();
            admin.setEmail("admin@jobvista.com");
            // Set password from environment variable instead of hardcoding
            admin.setPassword(passwordEncoder.encode(System.getenv("ADMIN_DEFAULT_PASSWORD")));
            // Set roles...
            userRepository.save(admin);
        }
    }
}
```

### 1.3 Job.title marked unique = true
**Problem:** `@Column(unique = true)` on the `title` field in the `Job` entity prevents multiple jobs with the same name across different companies.
**Solution:**
Remove the `unique = true` attribute in `Job.java`:
```java
// In src/main/java/.../entity/Job.java
// Change:
// @Column(unique = true)
// private String title;

// To:
@Column(nullable = false)
private String title;
```

### 1.4 JWT expiry set to 50 minutes (not hours)
**Problem:** Access token expires in 50 minutes (`3000000` ms) while refresh tokens are set to 7 days in the database but 24 hours in the `.properties`.
**Solution:**
Update `application.properties` to standardize token lifespans (e.g., 1 hour access, 7 days refresh):
```properties
jwt.access-expiration=3600000       # 1 hour
jwt.refresh-expiration=604800000      # 7 days
```
Ensure the token creation logic reads the `jwt.refresh-expiration` property instead of hardcoding `ChronoUnit.DAYS`.

### 1.5 `/api/v1/application/**` fully public
**Problem:** The `SecurityConfig` allows `permitAll()` for `/api/v1/application/**`, bypassing early Spring Security filters.
**Solution:**
Update `SecurityConfig.java` to protect the path correctly:
```java
// In SecurityConfig.java inside filterChain method:
http.authorizeHttpRequests(auth -> auth
    // ... other public endpoints
    .requestMatchers("/api/v1/application/**").authenticated() // Require Auth
    .anyRequest().authenticated()
);
```

### 1.6 JobDetails.jsx is empty
**Problem:** `src/pages/user/JobDetails.jsx` is 0 bytes, crashing the React app on navigation.
**Solution:**
Implement a standard React component skeleton in `JobDetails.jsx`:
```jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const JobDetails = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);

    useEffect(() => {
        // Fetch job logic here
    }, [id]);

    return (
        <div className="container mx-auto p-4">
            <h1>Job Details</h1>
        </div>
    );
};

export default JobDetails;
```

### 1.7 Duplicate Logger instantiation
**Problem:** `AuthController` creates a named logger `LoggerFactory.getILoggerFactory().getLogger("log")` improperly.
**Solution:**
Use standard class-based logging in `AuthController.java`:
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    // Alternatively, use Lombok's @Slf4j annotation
}
```

---

## 2. Security Risks

### 2.1 Refresh token sent in response body
**Problem:** Refresh token is returned in the JSON body AND as an httpOnly cookie, exposing it to JS (localStorage).
**Solution:**
Modify the login response DTO/logic to return only the access token in the JSON body.
```java
// In AuthController.java login logic:
ResponseCookie refreshTokenCookie = ResponseCookie.from("refresh_token", refreshToken)
    .httpOnly(true)
    .secure(true) // Set to true in prod
    .path("/")
    .maxAge(7 * 24 * 60 * 60)
    .build();

return ResponseEntity.ok()
    .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
    .body(new TokenResponseDTO(accessToken)); // Remove refreshToken from DTO
```

### 2.2 Access token in localStorage
**Problem:** The frontend stores the access token in `localStorage`, vulnerable to XSS.
**Solution:**
Store the access token in memory (e.g., using React Context or a top-level state) and utilize the `httpOnly` refresh token to acquire a new access token seamlessly when the user reloads the page.

### 2.3 File upload — no type/content validation
**Problem:** Uploading files allows any type, introducing XSS risks via SVG/HTML uploads.
**Solution:**
Add a content-type validation layer in the upload service:
```java
public String uploadFile(MultipartFile file) {
    List<String> allowedMimeTypes = Arrays.asList("image/jpeg", "image/png", "application/pdf");
    if (!allowedMimeTypes.contains(file.getContentType())) {
        throw new IllegalArgumentException("Invalid file type.");
    }
    // Proceed with upload
}
```

### 2.4 CORS allows all *.vercel.app subdomains
**Problem:** CORS is misconfigured to allow credentialed requests from any Vercel domain.
**Solution:**
Update the CORS configuration in `SecurityConfig.java` to whitelist only your explicit frontend domain:
```java
CorsConfiguration configuration = new CorsConfiguration();
configuration.setAllowedOrigins(Arrays.asList("https://your-actual-app.vercel.app", "http://localhost:5173"));
configuration.setAllowCredentials(true);
// ... allowed methods, headers
```

### 2.5 Admin password hardcoded as admin123
**Problem:** `AdminSeeder` sets `admin123` explicitly.
**Solution:**
As mentioned in 1.2, load the default password from an environment variable: `System.getenv("ADMIN_DEFAULT_PASSWORD")`. Also, mandate a password reset on first login by adding a `requiresPasswordReset` boolean to the `User` entity.

### 2.6 No rate limiting on auth endpoints
**Problem:** Login and register endpoints are susceptible to brute force attacks.
**Solution:**
Implement rate limiting using Bucket4j:
```xml
<!-- In pom.xml -->
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.1.0</version>
</dependency>
```
Implement a `Filter` or Interceptor to rate limit based on the client IP for `/api/v1/auth/**`.

---

## 3. Architecture & Code Quality

### 3.1 Zero test coverage
**Solution:** Start adding tests using JUnit 5 and Mockito.
- **Repository:** `@DataJpaTest`
- **Service:** `@ExtendWith(MockitoExtension.class)`
- **Controller:** `@WebMvcTest` + `MockMvc`

### 3.2 In-memory cache is not production-safe
**Solution:** Install Redis.
Add dependency:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```
Update `application.properties`:
```properties
spring.cache.type=redis
spring.data.redis.host=${REDIS_HOST}
spring.data.redis.port=${REDIS_PORT}
```

### 3.3 `ddl-auto=update` in production
**Solution:**
Change `application.properties` for production:
```properties
spring.jpa.hibernate.ddl-auto=validate
```
*See section 4.1 for Flyway integration.*

### 3.4 No pagination guard on large queries
**Solution:** Modify repository and service methods to use Spring Data JPA `Pageable`.
```java
// Repository
Page<Application> findByJobId(Long jobId, Pageable pageable);

// Controller
@GetMapping("/applications")
public ResponseEntity<Page<Application>> getApplications(
    @RequestParam Long jobId, 
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId, PageRequest.of(page, size)));
}
```

### 3.5 Missing global error boundary (frontend)
**Solution:** Create an `ErrorBoundary.jsx` and wrap your app routes.
```jsx
import { ErrorBoundary } from 'react-error-boundary';

function Fallback({ error }) {
  return <div role="alert"><h2>Something went wrong!</h2><p>{error.message}</p></div>;
}

// In App.jsx
<ErrorBoundary FallbackComponent={Fallback}>
   <AppRoutes />
</ErrorBoundary>
```

### 3.6 UI components (Button, Card, Input) are empty
**Solution:** Implement reusable Tailwind components in `src/components/ui/`.
*Example: Button.jsx*
```jsx
export const Button = ({ children, className, ...props }) => (
  <button className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${className}`} {...props}>
    {children}
  </button>
);
```

### 3.7 N+1 query risk in job listings
**Solution:** Use `@EntityGraph` or `JOIN FETCH` for the Company relationship in `JobRepository`.
```java
@EntityGraph(attributePaths = {"company"})
Page<Job> findAll(Pageable pageable);
```

### 3.8 WebSocket has no authentication
**Solution:** Implement a `ChannelInterceptor` in `WebSocketConfig` to validate the JWT before connecting.

### 3.9 `getAllApplications` is isAuthenticated() only
**Solution:** Ensure the endpoint is secured with role-based access.
```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/all")
public ResponseEntity<?> getAllApplications() { ... }
```

---

## 4. Industry-level improvements

### 4.1 Add Flyway migrations
**Solution:**
1. Add `flyway-core` to `pom.xml`.
2. Create `src/main/resources/db/migration/V1__init.sql` containing your DB schema.
3. Spring Boot will automatically run it on startup.

### 4.2 Structured logging with correlation IDs
**Solution:** Add a `Filter` to put a UUID into MDC.
```java
import org.slf4j.MDC;

@Component
public class CorrelationIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) {
        MDC.put("correlationId", UUID.randomUUID().toString());
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");
        }
    }
}
```
Update `logback-spring.xml` to log `%X{correlationId}`.

### 4.3 CI/CD pipeline
**Solution:** Create `.github/workflows/deploy.yml` mapping out steps: Checkout -> Setup JDK -> Run Tests (`mvn test`) -> Build Docker -> Push -> Deploy.

### 4.4 Email verification on registration
**Solution:**
1. Add `emailVerified` boolean to `User`.
2. On register, generate a token, save it, and email a link: `https://app.com/verify?token=XYZ`.
3. Create an endpoint that verifies the token and flips `emailVerified = true`.

### 4.5 Resume file storage — use S3/object storage
**Solution:** Integrate AWS SDK `S3Client`.
Instead of saving `MultipartFile` locally, upload to S3 and store the S3 URL in the database. 

### 4.6 Add `/health` and readiness checks
**Solution:** Enable Spring Actuator endpoints in `application.properties`:
```properties
management.endpoints.web.exposure.include=health,info
management.endpoint.health.probes.enabled=true
```
Configure Render to use `/actuator/health/readiness` as the Readiness Check URL.
