-- V1: Baseline — documents current schema state
-- This file tells Flyway "the DB already exists, start tracking from here"

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    profile_picture VARCHAR(255),
    cover_photo VARCHAR(255)
);

-- Job table
CREATE TABLE IF NOT EXISTS job (
    id BIGSERIAL PRIMARY KEY,
    job_id UUID NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    external_id VARCHAR(255),
    description VARCHAR(2000),
    job_type VARCHAR(50),
    employment_type VARCHAR(50),
    location VARCHAR(255),
    salary_or_stipend VARCHAR(255),
    source VARCHAR(255),
    required_skills VARCHAR(255) NOT NULL,
    experience_required INTEGER,
    company_id BIGINT NOT NULL,
    company_name VARCHAR(255),
    posted_at TIMESTAMP,
    redirect_url VARCHAR(255),
    last_date TIMESTAMP
);

-- Company table
CREATE TABLE IF NOT EXISTS company (
    id BIGSERIAL PRIMARY KEY,
    company_id UUID NOT NULL UNIQUE,
    company_name VARCHAR(255),
    company_email VARCHAR(255),
    company_website VARCHAR(255),
    location VARCHAR(255),
    description VARCHAR(255),
    logo VARCHAR(255),
    banner VARCHAR(255),
    user_id BIGINT
);

-- Job seeker table
CREATE TABLE IF NOT EXISTS job_seeker (
    id BIGSERIAL PRIMARY KEY,
    job_seeker_id UUID NOT NULL UNIQUE,
    skills VARCHAR(255),
    experience INTEGER,
    education VARCHAR(255),
    location VARCHAR(255),
    profile_summary VARCHAR(255),
    resume_url VARCHAR(255),
    user_id BIGINT
);

-- Job application table
CREATE TABLE IF NOT EXISTS job_application (
    id BIGSERIAL PRIMARY KEY,
    job_application_id UUID NOT NULL UNIQUE,
    application_status VARCHAR(50),
    applied_at TIMESTAMP,
    job_id BIGINT,
    job_seeker_id BIGINT
);

-- Saved jobs table
CREATE TABLE IF NOT EXISTS saved_job (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    job_id BIGINT,
    saved_at TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notification (
    id BIGSERIAL PRIMARY KEY,
    message VARCHAR(255),
    type VARCHAR(50),
    is_read BOOLEAN,
    created_at TIMESTAMP,
    user_id BIGINT
);

-- Blacklisted tokens table
CREATE TABLE IF NOT EXISTS black_listed_token (
    id UUID PRIMARY KEY,
    token VARCHAR(255),
    expiry_date TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_token (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255),
    expiry_date TIMESTAMP,
    revoked BOOLEAN,
    user_id BIGINT
);

-- Recently viewed jobs table
CREATE TABLE IF NOT EXISTS recently_viewed_job (
    id BIGSERIAL PRIMARY KEY,
    viewed_at TIMESTAMP,
    user_id BIGINT,
    job_id BIGINT
);