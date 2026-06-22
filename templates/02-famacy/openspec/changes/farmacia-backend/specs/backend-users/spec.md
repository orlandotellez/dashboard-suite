# Backend-Users Specification

## Purpose

User management module for farmacia backend. Provides CRUD operations for users with Role-Based Access Control (RBAC). Only admin role can create, update, or delete users. All users have soft delete capability via `deletedAt` field.

## Requirements

### Requirement: List Users (Admin Only)

The system MUST provide a GET endpoint at `/users` that returns all active (non-deleted) users. The system MUST require admin role to access this endpoint. The system MUST return user data without password hashes. The system MUST support pagination with `page` and `limit` query parameters. The system MUST exclude soft-deleted users (where `deletedAt` is not null).

#### Scenario: Admin lists all users

- GIVEN admin is authenticated with valid JWT
- WHEN GET /users with Authorization: Bearer <token>
- THEN system MUST return 200 status with array of all active users (id, name, email, role, createdAt)

#### Scenario: Non-admin tries to list users

- GIVEN staff or customer is authenticated
- WHEN GET /users with valid JWT but insufficient role
- THEN system MUST return 403 status with error "Insufficient permissions"

#### Scenario: List users with pagination

- GIVEN 25 active users exist in database
- WHEN GET /users?page=2&limit=10 with admin token
- THEN system MUST return 200 status with users 11-20 and pagination metadata {page: 2, limit: 10, total: 25, totalPages: 3}

### Requirement: Get User by ID (Admin Only)

The system MUST provide a GET endpoint at `/users/:id` that returns a specific user's details. The system MUST require admin role. The system MUST return 404 if user not found or is soft-deleted.

#### Scenario: Admin gets existing user

- GIVEN admin is authenticated and user with ID "123" exists
- WHEN GET /users/123 with admin token
- THEN system MUST return 200 status with user details (excluding password)

#### Scenario: Get non-existent user

- GIVEN no user exists with ID "nonexistent"
- WHEN GET /users/nonexistent with admin token
- THEN system MUST return 404 status with error "User not found"

### Requirement: Create User (Admin Only)

The system MUST provide a POST endpoint at `/users` that creates new users. The system MUST require admin role. The system MUST validate input with Zod schema (name, email, password, role). The system MUST hash passwords with bcrypt. The system MUST reject duplicate emails. The system MUST allow creating users with roles: admin, staff, customer.

#### Scenario: Admin creates new user

- GIVEN admin is authenticated
- WHEN POST /users with {name: "Nuevo Staff", email: "staff@farmacia.com", password: "Password123!", role: "staff"}
- THEN system MUST return 201 status, create user in DB, and return user data (without password)

#### Scenario: Create user with existing email

- GIVEN a user with email "existe@farmacia.com" already exists
- WHEN POST /users with {email: "existe@farmacia.com", ...}
- THEN system MUST return 409 status with error "Email already registered"

#### Scenario: Create user with invalid role

- GIVEN admin tries to create user with role "invalid_role"
- WHEN POST /users with {role: "invalid_role"}
- THEN system MUST return 400 status with error "Invalid role. Must be: admin, staff, customer"

### Requirement: Update User (Admin Only)

The system MUST provide a PUT endpoint at `/users/:id` that updates user data. The system MUST require admin role. The system MUST allow updating name, email, and role. The system MUST NOT allow updating own role (self-preservation). The system MUST hash new password if provided. The system MUST return 404 if user not found or soft-deleted.

#### Scenario: Admin updates user data

- GIVEN admin is authenticated and user "123" exists
- WHEN PUT /users/123 with {name: "Updated Name", role: "staff"}
- THEN system MUST return 200 status and update user in database

#### Scenario: Admin tries to update own role

- GIVEN admin with ID "admin-id" is authenticated
- WHEN PUT /users/admin-id with {role: "customer"}
- THEN system MUST return 403 status with error "Cannot change your own role"

#### Scenario: Update with duplicate email

- GIVEN user "123" exists with email "old@farmacia.com", and user "456" has email "new@farmacia.com"
- WHEN PUT /users/123 with {email: "new@farmacia.com"}
- THEN system MUST return 409 status with error "Email already in use"

### Requirement: Delete User (Admin Only, Soft Delete)

The system MUST provide a DELETE endpoint at `/users/:id` that soft-deletes users. The system MUST require admin role. The system MUST NOT allow deleting own account (self-preservation). The system MUST set `deletedAt` to current timestamp instead of removing the record. The system MUST return 404 if user already soft-deleted.

#### Scenario: Admin deletes a user

- GIVEN admin is authenticated and user "123" exists (deletedAt is null)
- WHEN DELETE /users/123 with admin token
- THEN system MUST return 200 status, set deletedAt to current timestamp, and user no longer appears in GET /users

#### Scenario: Admin tries to delete self

- GIVEN admin with ID "admin-id" is authenticated
- WHEN DELETE /users/admin-id
- THEN system MUST return 403 status with error "Cannot delete your own account"

#### Scenario: Delete already deleted user

- GIVEN user "123" has deletedAt set (already soft-deleted)
- WHEN DELETE /users/123 with admin token
- THEN system MUST return 404 status with error "User not found"

### Requirement: RBAC Middleware for User Endpoints

The system MUST use `requireRoles(['admin'])` middleware on all /users endpoints (except GET /users/:id which also requires admin). The system MUST check JWT token validity before checking roles. The system MUST return 401 if token is invalid/expired, 403 if role is insufficient.

#### Scenario: Access without token

- GIVEN no Authorization header is provided
- WHEN GET /users
- THEN system MUST return 401 status with error "Authentication required"

#### Scenario: Access with valid token but wrong role

- GIVEN staff user is authenticated with valid JWT
- WHEN DELETE /users/123
- THEN system MUST return 403 status with error "Insufficient permissions"
