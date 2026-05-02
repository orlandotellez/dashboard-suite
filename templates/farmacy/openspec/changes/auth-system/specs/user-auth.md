# User Auth Specification

## Purpose

Define el comportamiento del sistema de autenticación simulado usando Zustand + localStorage, sin backend real.

## Requirements

### Requirement: User Registration

The system MUST allow new users to register with email, password, name, and role. The system SHALL generate a mock JWT token upon successful registration and store it in Zustand + localStorage.

#### Scenario: Successful registration

- GIVEN no user is logged in
- WHEN user submits valid email, password, name, and role
- THEN system creates user in Zustand store, generates mock JWT, and sets auth state to logged in

#### Scenario: Registration with existing email

- GIVEN a user with email "test@test.com" already exists
- WHEN user submits registration with the same email
- THEN system SHALL reject registration and display error message

### Requirement: User Login

The system MUST authenticate users against the Zustand store user list. The system SHALL accept any non-empty password for demo purposes.

#### Scenario: Successful login

- GIVEN a user exists in the store with email "admin@stockmolt.com"
- WHEN user submits correct email and any non-empty password
- THEN system generates mock JWT, stores in localStorage, and updates auth state

#### Scenario: Login with non-existent user

- GIVEN no user exists with email "nonexistent@test.com"
- WHEN user attempts login with that email
- THEN system SHALL reject login and display "Usuario no encontrado"

### Requirement: User Logout

The system MUST allow logged-in users to terminate their session. The system SHALL clear JWT from localStorage and reset Zustand auth state.

#### Scenario: Successful logout

- GIVEN user is logged in with valid mock JWT
- WHEN user clicks logout button
- THEN system clears auth state, removes JWT from localStorage, and redirects to /login

### Requirement: Session Persistence

The system MUST persist authentication state across page reloads using Zustand persist middleware with localStorage.

#### Scenario: Page reload with valid session

- GIVEN user has valid mock JWT in localStorage
- WHEN user reloads the page
- THEN system restores auth state from localStorage and keeps user logged in

#### Scenario: Page reload without session

- GIVEN localStorage has no auth-storage data
- WHEN user reloads the page
- THEN system shows unauthenticated state and redirects to /login if on protected route
