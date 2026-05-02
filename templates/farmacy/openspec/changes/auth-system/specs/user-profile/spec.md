# User-Profile Specification

## Purpose

Profile page displaying user information, role, and allowing basic data edits. Accessible to all authenticated users.

## Requirements

### Requirement: View Profile

The system MUST display current user's name, email, and role on Profile page. The system MUST be accessible via `/perfil` route.

#### Scenario: User views own profile

- GIVEN user is authenticated
- WHEN user navigates to `/perfil`
- THEN system MUST display user's name, email, and role badge

#### Scenario: Unauthenticated access

- GIVEN user is NOT authenticated
- WHEN user navigates to `/perfil`
- THEN system MUST redirect to `/login` via ProtectedRoute

### Requirement: Edit Profile Data

The system MUST allow users to edit their name and password. The system MUST verify current password before saving changes.

#### Scenario: User updates name

- GIVEN user is on Profile page
- WHEN user edits name field and clicks save
- THEN system MUST update name in Zustand store and show success message

#### Scenario: User changes password

- GIVEN user is on Profile page
- WHEN user enters current password and new password, then submits
- THEN system MUST update password in Zustand store

#### Scenario: Password change with wrong current password

- GIVEN user is on Profile page
- WHEN user enters incorrect current password
- THEN system MUST reject and show "Current password is incorrect" error

### Requirement: Profile Link in Header

The system MUST display a link to Profile page in the dashboard header. The system MUST use `User` icon from lucide-react.

#### Scenario: Header shows profile link

- GIVEN user is authenticated
- WHEN dashboard header renders
- THEN system MUST display `User` icon linking to `/perfil`
