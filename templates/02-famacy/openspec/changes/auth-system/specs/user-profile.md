# User Profile Specification

## Purpose

Define la página de perfil donde el usuario puede ver su información, rol, y editar datos básicos.

## Requirements

### Requirement: View Profile

The system MUST allow logged-in users to view their own profile information. The system SHALL display email, name, and role.

#### Scenario: User views own profile

- GIVEN user is logged in with email "test@test.com"
- WHEN user navigates to `/perfil`
- THEN system displays profile page with user's email, name, and role

#### Scenario: Unauthenticated user accesses profile

- GIVEN no user is logged in
- WHEN user navigates to `/perfil`
- THEN system redirects to `/login` via ProtectedRoute

### Requirement: Edit Profile Data

The system MUST allow users to edit their name and password. The system SHALL require current password for password changes.

#### Scenario: User edits name

- GIVEN user is on ProfilePage
- WHEN user changes name field and clicks save
- THEN system updates name in Zustand store and shows success message

#### Scenario: User changes password

- GIVEN user is on ProfilePage
- WHEN user enters current password and new password, then clicks save
- THEN system validates current password and updates to new password

#### Scenario: Password change with wrong current password

- GIVEN user is on ProfilePage
- WHEN user enters incorrect current password
- THEN system SHALL reject change and display "Contraseña actual incorrecta"

### Requirement: Profile Navigation

The system MUST provide navigation access to the profile page. The system SHALL include a link to `/perfil` in the sidebar or header.

#### Scenario: Access profile from sidebar

- GIVEN user is logged in and sidebar is visible
- WHEN user clicks on "Perfil" link in sidebar
- THEN system navigates to `/perfil`
