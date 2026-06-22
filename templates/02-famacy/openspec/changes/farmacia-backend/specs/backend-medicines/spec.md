# Backend-Medicines Specification

## Purpose

Medicine inventory management module for farmacia backend. Provides CRUD operations for medications with stock control. Supports soft delete via `deletedAt` field. All endpoints require authentication with appropriate RBAC roles (admin/staff can modify, customer read-only).

## Requirements

### Requirement: List Medicines (Authenticated Users)

The system MUST provide a GET endpoint at `/medicines` that returns all active (non-deleted) medicines. The system MUST require authentication (any valid role). The system MUST support search by name/trade name via `q` query parameter. The system MUST support filtering by laboratory, category, and stock status. The system MUST support pagination with `page` and `limit`. The system MUST exclude soft-deleted medicines.

#### Scenario: List all medicines

- GIVEN user is authenticated (any role) and 15 medicines exist (none deleted)
- WHEN GET /medicines with valid JWT
- THEN system MUST return 200 status with array of medicines (id, tradeName, genericName, stock, price, laboratory)

#### Scenario: Search medicines by name

- GIVEN medicines "Ibuprofeno 400mg" and "Ibuprofeno 600mg" exist
- WHEN GET /medicines?q=ibuprofeno with valid JWT
- THEN system MUST return 200 status with medicines containing "ibuprofeno" in tradeName or genericName

#### Scenario: Filter medicines with low stock

- GIVEN medicines exist with stock < 10 (low stock threshold)
- WHEN GET /medicines?stockStatus=low with valid JWT
- THEN system MUST return 200 status with only medicines where stock < 10

#### Scenario: Paginated list

- GIVEN 50 active medicines exist
- WHEN GET /medicines?page=3&limit=10 with valid JWT
- THEN system MUST return 200 status with medicines 21-30 and pagination metadata

### Requirement: Get Medicine by ID (Authenticated Users)

The system MUST provide a GET endpoint at `/medicines/:id` that returns medicine details. The system MUST require authentication. The system MUST return 404 if medicine not found or is soft-deleted.

#### Scenario: Get existing medicine

- GIVEN medicine with ID "med-123" exists and is not deleted
- WHEN GET /medicines/med-123 with valid JWT
- THEN system MUST return 200 status with full medicine details

#### Scenario: Get soft-deleted medicine

- GIVEN medicine with ID "med-456" exists but has deletedAt set
- WHEN GET /medicines/med-456 with valid JWT
- THEN system MUST return 404 status with error "Medicine not found"

### Requirement: Create Medicine (Admin/Staff Only)

The system MUST provide a POST endpoint at `/medicines` that creates new medicine records. The system MUST require admin or staff role. The system MUST validate input with Zod schema (tradeName, genericName, description, price, stock, laboratoryId, categoryId, expiryDate). The system MUST set initial `deletedAt` to null.

#### Scenario: Admin creates new medicine

- GIVEN admin or staff is authenticated
- WHEN POST /medicines with {tradeName: "Ibuprofeno", genericName: "Ibuprofeno", price: 12.50, stock: 100, laboratoryId: "lab-1", categoryId: "cat-1"}
- THEN system MUST return 201 status, create medicine in DB, and return medicine data

#### Scenario: Create medicine with invalid data

- GIVEN POST /medicines with {price: -5, stock: "invalid"}
- WHEN system validates with Zod schema
- THEN system MUST return 400 status with validation errors

#### Scenario: Customer tries to create medicine

- GIVEN customer is authenticated
- WHEN POST /medicines with valid medicine data
- THEN system MUST return 403 status with error "Insufficient permissions"

### Requirement: Update Medicine (Admin/Staff Only)

The system MUST provide a PUT endpoint at `/medicines/:id` that updates medicine data. The system MUST require admin or staff role. The system MUST allow updating tradeName, genericName, description, price, laboratoryId, categoryId, expiryDate. The system MUST NOT allow updating stock directly (use PATCH /stock endpoint). The system MUST return 404 if medicine not found or soft-deleted.

#### Scenario: Update medicine details

- GIVEN medicine "med-123" exists and staff is authenticated
- WHEN PUT /medicines/med-123 with {tradeName: "Ibuprofeno 400mg", price: 15.00}
- THEN system MUST return 200 status and update medicine in database

#### Scenario: Update stock via PUT (should fail)

- GIVEN medicine "med-123" exists
- WHEN PUT /medicines/med-123 with {stock: 200}
- THEN system MUST return 400 status with error "Use PATCH /medicines/:id/stock to update stock"

### Requirement: Update Medicine Stock (Admin/Staff Only)

The system MUST provide a PATCH endpoint at `/medicines/:id/stock` that updates medicine stock. The system MUST require admin or staff role. The system MUST accept `stock` (absolute) or `increment`/`decrement` (relative) in request body. The system MUST validate stock doesn't go negative. The system MUST return 404 if medicine not found or soft-deleted.

#### Scenario: Set absolute stock value

- GIVEN medicine "med-123" exists with current stock 50
- WHEN PATCH /medicines/med-123/stock with {stock: 100}
- THEN system MUST return 200 status and set stock to 100

#### Scenario: Increment stock

- GIVEN medicine "med-123" exists with current stock 50
- WHEN PATCH /medicines/med-123/stock with {increment: 25}
- THEN system MUST return 200 status and set stock to 75

#### Scenario: Decrement stock below zero (should fail)

- GIVEN medicine "med-123" exists with current stock 10
- WHEN PATCH /medicines/med-123/stock with {decrement: 15}
- THEN system MUST return 400 status with error "Stock cannot be negative"

### Requirement: Delete Medicine (Admin Only, Soft Delete)

The system MUST provide a DELETE endpoint at `/medicines/:id` that soft-deletes medicines. The system MUST require admin role only. The system MUST set `deletedAt` to current timestamp. The system MUST return 404 if medicine already soft-deleted.

#### Scenario: Admin soft-deletes medicine

- GIVEN admin is authenticated and medicine "med-123" exists (deletedAt is null)
- WHEN DELETE /medicines/med-123 with admin token
- THEN system MUST return 200 status, set deletedAt to current timestamp, and medicine no longer appears in GET /medicines

#### Scenario: Staff tries to delete medicine

- GIVEN staff is authenticated
- WHEN DELETE /medicines/med-123
- THEN system MUST return 403 status with error "Insufficient permissions"

#### Scenario: Delete already deleted medicine

- GIVEN medicine "med-456" has deletedAt set
- WHEN DELETE /medicines/med-456 with admin token
- THEN system MUST return 404 status with error "Medicine not found"
