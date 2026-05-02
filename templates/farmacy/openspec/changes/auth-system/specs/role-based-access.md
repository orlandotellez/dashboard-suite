# Role-Based Access Specification

## Purpose

Define el control de acceso basado en roles (RBAC) con tres roles: admin, staff, y customer.

## Requirements

### Requirement: Role Definitions

The system MUST support three roles: `admin`, `staff`, and `customer`. The system SHALL assign `customer` role by default to new registrations unless specified otherwise.

#### Scenario: Default role assignment

- GIVEN a new user registers without specifying role
- WHEN registration completes
- THEN system assigns `customer` role to the new user

#### Scenario: Admin role assignment

- GIVEN an admin user creates a new user
- WHEN admin selects `staff` role from dropdown
- THEN system creates user with `staff` role

### Requirement: Protected Route Access

The system MUST restrict access to routes based on user roles using a `ProtectedRoute` component. The system SHALL redirect unauthenticated users to `/login`.

#### Scenario: Unauthenticated user accesses protected route

- GIVEN no user is logged in
- WHEN user navigates to `/usuarios`
- THEN system redirects to `/login` and preserves intended destination

#### Scenario: Authenticated user with insufficient role

- GIVEN user with `customer` role is logged in
- WHEN user navigates to `/usuarios` (admin only)
- THEN system SHALL deny access and redirect to `/` or show unauthorized message

#### Scenario: Authorized role accesses route

- GIVEN user with `admin` role is logged in
- WHEN user navigates to `/usuarios`
- THEN system allows access and renders UserManagementPage

### Requirement: Route Configuration

The system MUST define public routes (`/login`, `/register`) and private routes with role restrictions. The system SHALL NOT require authentication for public routes.

#### Scenario: Access to public login route

- GIVEN no user is logged in
- WHEN user navigates to `/login`
- THEN system renders LoginPage without redirection

#### Scenario: Authenticated user accesses login

- GIVEN user is logged in
- WHEN user navigates to `/login`
- THEN system SHALL redirect to `/` (dashboard home)
