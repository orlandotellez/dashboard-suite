# User-Auth Specification

## Purpose

Simulated authentication system using Zustand + localStorage persist middleware. No real backend. Mock JWT tokens stored in Zustand/auth store.

## Requirements

### Requirement: User Registration

The system MUST allow new users to register with name, email, password, and role. The system MUST reject registration with duplicate email.

#### Scenario: Successful registration

- GIVEN no user exists with email "user@test.com"
- WHEN user submits registration form with valid data
- THEN system creates user in Zustand store and redirects to login

#### Scenario: Registration with duplicate email

- GIVEN a user with email "user@test.com" already exists
- WHEN user submits registration with same email
- THEN system MUST reject and show "Email already registered" error

### Requirement: User Login

The system MUST authenticate users with email and password. The system MUST generate a mock JWT token and store it in Zustand + localStorage. The system MUST accept any non-empty password for mock users.

#### Scenario: Successful login

- GIVEN a registered user exists with email "admin@test.com"
- WHEN user submits login with correct email and any non-empty password
- THEN system MUST set `isAuthenticated=true`, store mock JWT, and redirect to dashboard

#### Scenario: Login with non-existent email

- GIVEN no user exists with email "unknown@test.com"
- WHEN user submits login form
- THEN system MUST reject and show "Invalid credentials" error

#### Scenario: Login with empty password

- GIVEN a registered user exists
- WHEN user submits login with empty password
- THEN system MUST reject and show "Password is required" error

### Requirement: User Logout

The system MUST clear auth state and remove mock JWT from localStorage on logout.

#### Scenario: Successful logout

- GIVEN user is authenticated
- WHEN user clicks logout button
- THEN system MUST set `isAuthenticated=false`, clear token, and redirect to login

### Requirement: Session Persistence

The system MUST persist auth state across page reloads using Zustand persist middleware with localStorage (`auth-storage` key).

#### Scenario: Reload preserves session

- GIVEN user is authenticated and `auth-storage` exists in localStorage
- WHEN page reloads
- THEN system MUST restore auth state and keep user logged in

#### Scenario: Missing storage clears session

- GIVEN localStorage has no `auth-storage` key
- WHEN page loads
- THEN system MUST set `isAuthenticated=false` and redirect to login
