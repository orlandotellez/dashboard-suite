# Backend-Auth Specification

## Purpose

Real JWT authentication system for farmacia backend using Fastify, Prisma, Redis, and Zod validation. Handles user registration, login, logout, and token refresh with role-based access (admin/staff/customer).

## Requirements

### Requirement: User Registration Endpoint

The system MUST provide a POST endpoint at `/auth/register` that creates new users with name, email, password, and role. The system MUST hash passwords using bcrypt. The system MUST reject registration with duplicate email. The system MUST assign `customer` role by default if no role specified. The system MUST return a JWT access token and refresh token on successful registration.

#### Scenario: Successful registration

- GIVEN no user exists with email "nuevo@farmacia.com"
- WHEN POST /auth/register with {name: "Nuevo Usuario", email: "nuevo@farmacia.com", password: "Password123!", role: "customer"}
- THEN system MUST create user in PostgreSQL via Prisma, return 201 status, and return access/refresh tokens

#### Scenario: Registration with duplicate email

- GIVEN a user with email "existe@farmacia.com" already exists
- WHEN POST /auth/register with {email: "existe@farmacia.com", ...}
- THEN system MUST return 409 status with error "Email already registered"

#### Scenario: Registration with invalid data

- GIVEN POST /auth/register with {email: "invalid-email", password: "123"}
- WHEN system validates input with Zod schema
- THEN system MUST return 400 status with validation errors

### Requirement: User Login Endpoint

The system MUST provide a POST endpoint at `/auth/login` that authenticates users with email and password. The system MUST verify password using bcrypt.compare(). The system MUST return JWT access token (short-lived, 15min) and refresh token (long-lived, 7d). The system MUST store refresh token in Redis with user ID as key and TTL matching token expiry.

#### Scenario: Successful login

- GIVEN a user exists with email "admin@farmacia.com" and correct password hash
- WHEN POST /auth/login with {email: "admin@farmacia.com", password: "Password123!"}
- THEN system MUST return 200 status, set HTTP-only cookies with tokens, and return user data (without password)

#### Scenario: Login with incorrect password

- GIVEN a user exists with email "admin@farmacia.com"
- WHEN POST /auth/login with {email: "admin@farmacia.com", password: "WrongPassword"}
- THEN system MUST return 401 status with error "Invalid credentials"

#### Scenario: Login with non-existent email

- GIVEN no user exists with email "noexiste@farmacia.com"
- WHEN POST /auth/login with {email: "noexiste@farmacia.com", ...}
- THEN system MUST return 401 status with error "Invalid credentials"

### Requirement: User Logout Endpoint

The system MUST provide a POST endpoint at `/auth/logout` that invalidates the refresh token. The system MUST delete the refresh token from Redis. The system MUST clear HTTP-only cookies containing tokens. The system MUST require authentication (valid access token) to access this endpoint.

#### Scenario: Successful logout

- GIVEN user is authenticated with valid access token and refresh token in Redis
- WHEN POST /auth/logout with valid Bearer token
- THEN system MUST return 200 status, delete refresh token from Redis, and clear cookies

#### Scenario: Logout without authentication

- GIVEN no valid access token is provided
- WHEN POST /auth/logout without Authorization header
- THEN system MUST return 401 status with error "Authentication required"

### Requirement: Token Refresh Endpoint

The system MUST provide a POST endpoint at `/auth/refresh` that generates new access/refresh tokens using a valid refresh token. The system MUST verify the refresh token from Redis. The system MUST rotate refresh tokens (delete old, store new). The system MUST return new access token (15min) and refresh token (7d).

#### Scenario: Successful token refresh

- GIVEN a valid refresh token exists in Redis for user ID "123"
- WHEN POST /auth/refresh with valid refresh token in cookie or body
- THEN system MUST return 200 status, new access/refresh tokens, and update Redis with new refresh token

#### Scenario: Refresh with invalid token

- GIVEN no valid refresh token exists in Redis
- WHEN POST /auth/refresh with invalid/expired refresh token
- THEN system MUST return 401 status with error "Invalid or expired refresh token"

#### Scenario: Refresh when Redis unavailable

- GIVEN Redis is disconnected (isRedisConnected() returns false)
- WHEN POST /auth/refresh with refresh token
- THEN system MUST return 401 status with error "Token refresh unavailable"

### Requirement: JWT Token Structure

The system MUST generate JWT access tokens containing: userId, email, role, and expiresIn (15 minutes). The system MUST generate JWT refresh tokens containing: userId and expiresIn (7 days). The system MUST use `@fastify/jwt` plugin for token signing/verification. The system MUST use environment variable `JWT_SECRET` for signing.

#### Scenario: Access token contains correct claims

- GIVEN user with ID "123", email "test@farmacia.com", role "admin" logs in
- WHEN system generates access token
- THEN token MUST decode to {userId: "123", email: "test@farmacia.com", role: "admin", exp: <15min from now>}

#### Scenario: Refresh token has longer expiry

- GIVEN user logs in successfully
- WHEN system generates tokens
- THEN refresh token expiry MUST be greater than access token expiry (7d vs 15min)
