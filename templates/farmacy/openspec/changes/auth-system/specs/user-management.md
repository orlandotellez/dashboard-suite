# User Management Specification

## Purpose

Define el CRUD de usuarios simulado en Zustand, accesible únicamente por usuarios con rol admin.

## Requirements

### Requirement: List Users (Admin Only)

The system MUST allow `admin` users to view all registered users. The system SHALL display users in a table with email, name, role, and actions.

#### Scenario: Admin views user list

- GIVEN user with `admin` role is logged in
- WHEN user navigates to `/usuarios`
- THEN system displays table with all users and their roles

#### Scenario: Non-admin attempts to view users

- GIVEN user with `staff` role is logged in
- WHEN user navigates to `/usuarios`
- THEN system SHALL deny access via ProtectedRoute

### Requirement: Create User (Admin Only)

The system MUST allow `admin` users to create new users with email, password, name, and role. The system SHALL prevent duplicate emails.

#### Scenario: Admin creates new user

- GIVEN admin is on UserManagementPage
- WHEN admin fills form with new email, password, name, and selects role
- THEN system adds user to Zustand store and refreshes user list

#### Scenario: Admin creates user with existing email

- GIVEN a user with email "test@test.com" already exists
- WHEN admin attempts to create user with same email
- THEN system SHALL display error "El email ya está registrado"

### Requirement: Edit User (Admin Only)

The system MUST allow `admin` users to edit existing user data (name, email, role). The system SHALL NOT allow editing own role if it would remove the last admin.

#### Scenario: Admin edits user name

- GIVEN admin is viewing user list
- WHEN admin clicks edit on a user and changes the name
- THEN system updates user in Zustand store and reflects changes in list

#### Scenario: Admin edits user role

- GIVEN admin is editing a user with `staff` role
- WHEN admin changes role to `admin`
- THEN system updates user role in store

### Requirement: Delete User (Admin Only)

The system MUST allow `admin` users to delete users. The system SHALL prevent deletion of the last admin user.

#### Scenario: Admin deletes a user

- GIVEN admin is viewing user list with multiple users
- WHEN admin clicks delete on a non-admin user and confirms
- THEN system removes user from Zustand store

#### Scenario: Attempt to delete last admin

- GIVEN only one admin user exists in the system
- WHEN admin attempts to delete that user
- THEN system SHALL reject deletion and display "No se puede eliminar el último administrador"
