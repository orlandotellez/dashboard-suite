# User-Management Specification

## Purpose

CRUD operations for users stored in Zustand. Only admin role can access UserManagement page and perform user modifications.

## Requirements

### Requirement: List Users (Admin Only)

The system MUST display all registered users on UserManagement page. The system MUST deny access to non-admin users.

#### Scenario: Admin lists users

- GIVEN user is authenticated as `admin`
- WHEN user navigates to `/usuarios`
- THEN system MUST display table with all users (name, email, role)

#### Scenario: Non-admin accesses user management

- GIVEN user is authenticated as `staff` or `customer`
- WHEN user navigates to `/usuarios`
- THEN system MUST deny access via ProtectedRoute

### Requirement: Create User (Admin Only)

The system MUST allow admin to create users with name, email, password, and role. The system MUST reject duplicate emails.

#### Scenario: Admin creates new user

- GIVEN admin is on UserManagement page
- WHEN admin fills form and submits with role `staff`
- THEN system MUST add user to Zustand store and refresh list

#### Scenario: Create with existing email

- GIVEN a user with email "exists@test.com" already exists
- WHEN admin tries to create user with same email
- THEN system MUST reject and show "Email already exists" error

### Requirement: Edit User (Admin Only)

The system MUST allow admin to edit user name, email, and role. The system MUST NOT allow editing own role (self-preservation).

#### Scenario: Admin edits user data

- GIVEN admin selects a user from the list
- WHEN admin updates name and submits
- THEN system MUST update user in Zustand store

#### Scenario: Admin edits own account

- GIVEN admin is editing their own user
- WHEN admin tries to change own role
- THEN system MUST disable role field or reject the change

### Requirement: Delete User (Admin Only)

The system MUST allow admin to delete users. The system MUST NOT allow deleting own account.

#### Scenario: Admin deletes a user

- GIVEN admin is on UserManagement page
- WHEN admin clicks delete on a non-self user
- THEN system MUST remove user from Zustand store after confirmation

#### Scenario: Admin tries to delete self

- GIVEN admin is viewing their own user
- WHEN admin attempts to delete own account
- THEN system MUST reject with "Cannot delete your own account" error
