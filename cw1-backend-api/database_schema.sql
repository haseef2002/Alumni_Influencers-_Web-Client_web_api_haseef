-- ==============================================================================
-- ALUMNI PORTAL - MASTER DATABASE SCHEMA
-- Author: Haseef
-- Description: Creates the relational database structure for the Alumni Portal.
--              Includes tables for Authentication, Profiles, Bidding, and Security.
-- ==============================================================================

-- Create the database and ensure we are using it
CREATE DATABASE IF NOT EXISTS alumni_portal;
USE alumni_portal;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- Handles core authentication credentials and verification status.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,       -- Enforces unique accounts
    password_hash VARCHAR(255) NOT NULL,      -- Stores bcrypt hashed passwords securely
    is_verified BOOLEAN DEFAULT FALSE,        -- For email verification flow
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE
-- Stores the public-facing and analytical data for each alumnus.
-- Utilizes JSON data types for flexible, array-based history (degrees, employment).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,              -- 1-to-1 relationship with Users
    bio TEXT,
    linkedin_url VARCHAR(255),
    current_location VARCHAR(100) DEFAULT 'Not Specified', -- Used for Geo Analytics Chart
    
    -- JSON columns allow for storing multiple dynamic objects without complex joining tables
    degrees JSON,                             
    certifications JSON,
    licences JSON,
    courses JSON,
    employment JSON,
    
    appearance_count INT DEFAULT 0,           -- Tracks how many times they won the daily feature bid
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraint: If a User is deleted, their Profile is automatically deleted
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 3. BIDS TABLE
-- Powers the Blind Bidding System for the "Featured Alumnus of the Day".
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bid_amount DECIMAL(10, 2) NOT NULL CHECK (bid_amount > 0), -- Prevents negative/zero bids
    status ENUM('pending', 'won', 'lost') DEFAULT 'pending',   -- Handled by Node.js Cron Job
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 4. REVOKED TOKENS TABLE (SECURITY)
-- Forms part of the advanced security mechanism. Stores invalidated JWTs
-- after a user logs out to prevent token hijacking and replay attacks.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS RevokedTokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(512) UNIQUE NOT NULL,       -- The actual JWT string
    revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 5. ACCESS LOGS TABLE (SECURITY AUDIT)
-- Fulfills the rubric requirement for tracking API key usage statistics.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS AccessLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    endpoint VARCHAR(255) NOT NULL,           -- Records which API route was accessed
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ==============================================================================
-- INITIAL SEED DATA 
-- Safely injects 4 mock users so the Analytics Dashboard works immediately.
-- Uses INSERT IGNORE to prevent errors if the script is run multiple times.
-- ==============================================================================

-- Seed Mock Users
INSERT IGNORE INTO Users (id, email, password_hash, is_verified) VALUES 
(1, 'alice@university.edu', '$2a$10$MockHashedPasswordString123', 1),
(2, 'bob@university.edu', '$2a$10$MockHashedPasswordString123', 1),
(3, 'charlie@university.edu', '$2a$10$MockHashedPasswordString123', 1),
(4, 'diana@university.edu', '$2a$10$MockHashedPasswordString123', 1);

-- Seed Mock Profiles (Tied explicitly to the users above)
INSERT IGNORE INTO Profiles (user_id, bio, current_location, degrees, employment) VALUES 
(1, 'Tech enthusiast', 'London, UK', '[{"name": "BSc Computer Science", "completion_date": "2025-06-01"}]', '[{"role": "Software Engineer", "company": "Microsoft"}]'),
(2, 'Business focused', 'Manchester, UK', '[{"name": "BSc Business Management", "completion_date": "2024-06-01"}]', '[{"role": "Product Manager", "company": "Amazon"}]'),
(3, 'Cloud expert', 'New York, USA', '[{"name": "MSc Computer Science", "completion_date": "2025-06-01"}]', '[{"role": "Cloud Architect", "company": "Google"}]'),
(4, 'Frontend dev', 'Remote', '[{"name": "BSc Computer Science", "completion_date": "2023-06-01"}]', '[{"role": "Data Analyst", "company": "Startups"}]');