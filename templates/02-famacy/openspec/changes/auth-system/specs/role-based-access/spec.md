# Role-Based-Access Specification

## Purpose

RBAC system with three roles (admin, staff, customer). ProtectedRoute component guards routes based on allowed roles.

## Requirements

### Requirement: Role Definitions

The system MUST support exactly three roles: `admin`, `staff`, `customer`. The system MUST assign `customer` role by default on registration.

#### Scenario: Default role assignment

- GIVEN new user registers without specifying role
- WHEN registration completes
- THEN system MUST assign `customer` role automatically

#### Scenario: Admin role assignment

- GIVEN admin creates a new user
- WHEN admin selects `staff` role
- THEN system MUST create user with `staff` role

### Requirement: ProtectedRoute Component

The system MUST provide a `ProtectedRoute` component that accepts `allowedRoles` prop. The system MUST redirect unauthenticated users to `/login`. The system MUST deny access if user role is not in `allowedRoles`.

#### Scenario: Authenticated user with allowed role

- GIVEN user is authenticated with role `admin`
- WHEN user navigates to `/usuarios` wrapped in `ProtectedRoute allowedRoles={['admin']}`
- THEN system MUST render the route content

#### Scenario: Unauthenticated user access

- GIVEN user is NOT authenticated
- WHEN user navigates to `/dashboard`
- THEN system MUST redirect to `/login` with return URL

#### Scenario: Authenticated user without permission

- GIVEN user is authenticated with role `customer`
- WHEN user navigates to `/usuarios` (admin only)
- THEN system MUST redirect to `/` or show "Access denied" message

### Requirement: Public Route Access

The system MUST allow unauthenticated users to access `/login` and `/register` routes. The system MUST NOT render ProtectedRoute on public routes.

#### Scenario: Guest accesses login page

- GIVEN user is NOT authenticated
- WHEN user navigates to `/login`
- THEN system MUST render LoginPage without redirection
