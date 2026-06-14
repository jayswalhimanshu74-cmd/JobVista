package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageServiceImplementation implements FileStorageService {

    @Value("${aws.s3.bucket:}")
    private String bucketName;

    @Value("${aws.s3.region:us-east-1}")
    private String region;

    @Value("${aws.s3.access-key:}")
    private String accessKey;

    @Value("${aws.s3.secret-key:}")
    private String secretKey;

    private S3Client s3Client;
    private boolean useS3 = false;

    @PostConstruct
    public void init() {
        if (bucketName != null && !bucketName.isEmpty() &&
                accessKey != null && !accessKey.isEmpty() &&
                secretKey != null && !secretKey.isEmpty()) {
            try {
                this.s3Client = S3Client.builder()
                        .region(Region.of(region))
                        .credentialsProvider(StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKey, secretKey)
                        ))
                        .build();
                this.useS3 = true;
                log.info("AWS S3 storage initialized successfully on bucket: {}", bucketName);
            } catch (Exception e) {
                log.error("Failed to initialize AWS S3 client. Falling back to local storage.", e);
            }
        } else {
            log.info("AWS S3 credentials not fully configured. Using local filesystem storage.");
        }
    }

    @Override
    public String storeFile(MultipartFile file, String folder) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;

        if (useS3) {
            try {
                String key = folder + "/" + fileName;
                s3Client.putObject(
                        PutObjectRequest.builder()
                                .bucket(bucketName)
                                .key(key)
                                .contentType(file.getContentType())
                                .build(),
                        RequestBody.fromBytes(file.getBytes())
                );
                return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key;
            } catch (Exception e) {
                log.error("Failed to upload file to S3. Falling back to local filesystem storage.", e);
            }
        }

        try {
            Path uploadPath = Paths.get("uploads/" + folder).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, file.getBytes());
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file on local filesystem", e);
        }
    }
}
