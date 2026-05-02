# Sidebar-Adaptation Specification

## Purpose

Dynamic sidebar that filters navigation items based on user role and auth state. Includes profile link and role-based menu items.

## Requirements

### Requirement: Conditional Navigation Items

The system MUST filter sidebar navigation items based on user role. The system MUST hide admin-only items from non-admin users.

#### Scenario: Admin sees all items

- GIVEN user is authenticated as `admin`
- WHEN sidebar renders
- THEN system MUST display all navigation items including "Usuarios"

#### Scenario: Staff sees limited items

- GIVEN user is authenticated as `staff`
- WHEN sidebar renders
- THEN system MUST hide "Usuarios" item and show only staff-accessible links

#### Scenario: Customer sees minimal items

- GIVEN user is authenticated as `customer`
- WHEN sidebar renders
- THEN system MUST show only customer-accessible links (e.g., Dashboard, Perfil)

### Requirement: Profile Link in Sidebar

The system MUST add a link to Profile page (`/perfil`) in the sidebar. The system MUST use `User` icon from lucide-react.

#### Scenario: Sidebar shows profile link

- GIVEN user is authenticated
- WHEN sidebar renders
- THEN system MUST display "Perfil" link with `User` icon pointing to `/perfil`

### Requirement: Guest Sidebar

The system MUST hide sidebar completely when user is NOT authenticated. The system MUST only show login/register pages.

#### Scenario: Unauthenticated user hides sidebar

- GIVEN user is NOT authenticated
- WHEN user is on `/login` or `/register`
- THEN system MUST NOT render sidebar

### Requirement: Active Route Highlighting

The system MUST highlight the current active route in the sidebar. The system MUST apply active styling to the current page link.

#### Scenario: Active link highlighted

- GIVEN user is on `/usuarios` page
- WHEN sidebar renders
- THEN system MUST highlight "Usuarios" link with active styling
