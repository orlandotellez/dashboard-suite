# Dashboard Adaptation Specification

## Purpose

Define cómo el dashboard se adapta según el rol del usuario y estado de autenticación, incluyendo sidebar condicional y header.

## Requirements

### Requirement: Sidebar Role-Based Items

The system MUST filter sidebar navigation items based on user role. The system SHALL show/hide items according to role permissions.

#### Scenario: Admin sees all sidebar items

- GIVEN user with `admin` role is logged in
- WHEN sidebar renders
- THEN system displays all items: Dashboard, Usuarios, Perfil

#### Scenario: Staff sees limited sidebar

- GIVEN user with `staff` role is logged in
- WHEN sidebar renders
- THEN system displays Dashboard and Perfil, but NOT Usuarios

#### Scenario: Customer sees minimal sidebar

- GIVEN user with `customer` role is logged in
- WHEN sidebar renders
- THEN system displays only Dashboard and Perfil

### Requirement: Sidebar Profile Link

The system MUST include a link to the user's profile in the sidebar. The system SHALL display the user's name or email next to the profile icon.

#### Scenario: Sidebar shows profile link

- GIVEN user is logged in with name "Juan Pérez"
- WHEN sidebar renders
- THEN system displays "Perfil" link with User icon from lucide-react

### Requirement: Header User Info

The system MUST display current user information in the dashboard header. The system SHALL show user's name/email and role.

#### Scenario: Header shows user info

- GIVEN user is logged in with name "Admin" and role "admin"
- WHEN dashboard header renders
- THEN system displays "Admin" and role badge "admin"

### Requirement: Unauthenticated Sidebar/Header

The system MUST hide sidebar and user-specific header content when user is not logged in. The system SHALL show only public navigation or redirect.

#### Scenario: Unauthenticated user state

- GIVEN no user is logged in
- WHEN user is on `/login` page
- THEN system SHALL NOT display sidebar or user info in header

#### Scenario: Sidebar hidden on protected route when unauthenticated

- GIVEN no user is logged in
- WHEN user tries to access `/` (dashboard home)
- THEN system redirects to `/login` via ProtectedRoute (sidebar never renders)
