# Backend-Clients Specification

## Purpose

Client management module for farmacia backend. Maintains customer records linked to sales transactions. Provides CRUD operations with soft delete via `deletedAt` field. All endpoints require authentication with appropriate RBAC roles.

## Requirements

### Requirement: List Clients (Authenticated Users)

The system MUST provide a GET endpoint at `/clients` that returns all active (non-deleted) clients. The system MUST require authentication (any valid role). The system MUST support search by name, documentNumber, or email via `q` query parameter. The system MUST support filtering by membership level (bronze, silver, gold). The system MUST support pagination with `page` and `limit`. The system MUST exclude soft-deleted clients.

#### Scenario: List all clients

- GIVEN user is authenticated (any role) and 20 clients exist (none deleted)
- WHEN GET /clients with valid JWT
- THEN system MUST return 200 status with array of clients (id, name, documentNumber, email, phone, membership)

#### Scenario: Search clients by name

- GIVEN clients "Juan Pérez" and "María Pérez" exist
- WHEN GET /clients?q=Pérez with valid JWT
- THEN system MUST return 200 status with clients containing "Pérez" in name

#### Scenario: Search clients by document number

- GIVEN client with documentNumber "12345678" exists
- WHEN GET /clients?q=12345678 with valid JWT
- THEN system MUST return 200 status with matching client

#### Scenario: Filter clients by membership

- GIVEN clients exist with membership levels: bronze, silver, gold
- WHEN GET /clients?membership=gold with valid JWT
- THEN system MUST return 200 status with only gold membership clients

### Requirement: Get Client by ID (Authenticated Users)

The system MUST provide a GET endpoint at `/clients/:id` that returns client details. The system MUST require authentication. The system MUST return client data with purchase history summary (total purchases, last purchase date). The system MUST return 404 if client not found or is soft-deleted.

#### Scenario: Get existing client with history

- GIVEN client "client-123" exists, is not deleted, and has 5 sales
- WHEN GET /clients/client-123 with valid JWT
- THEN system MUST return 200 status with client details and {totalPurchases: 5, totalSpent: <sum>, lastPurchase: <date>}

#### Scenario: Get soft-deleted client

- GIVEN client "client-456" exists but has deletedAt set
- WHEN GET /clients/client-456 with valid JWT
- THEN system MUST return 404 status with error "Client not found"

### Requirement: Create Client (Admin/Staff Only)

The system MUST provide a POST endpoint at `/clients` that creates new client records. The system MUST require admin or staff role. The system MUST validate input with Zod schema (name, documentNumber, email, phone, address, membership). The system MUST ensure documentNumber is unique. The system MUST set default `membership` to "bronze" if not specified. The system MUST set initial `deletedAt` to null.

#### Scenario: Staff creates new client

- GIVEN staff is authenticated
- WHEN POST /clients with {name: "Juan Pérez", documentNumber: "12345678", email: "juan@email.com", phone: "555-1234", membership: "silver"}
- THEN system MUST return 201 status, create client in DB, and return client data

#### Scenario: Create client with duplicate document

- GIVEN client with documentNumber "12345678" already exists
- WHEN POST /clients with {documentNumber: "12345678", ...}
- THEN system MUST return 409 status with error "Document number already registered"

#### Scenario: Create client with invalid email

- GIVEN POST /clients with {email: "invalid-email", ...}
- WHEN system validates with Zod schema
- THEN system MUST return 400 status with validation error for email

#### Scenario: Customer tries to create client

- GIVEN customer is authenticated
- WHEN POST /clients with valid client data
- THEN system MUST return 403 status with error "Insufficient permissions"

### Requirement: Update Client (Admin/Staff Only)

The system MUST provide a PUT endpoint at `/clients/:id` that updates client data. The system MUST require admin or staff role. The system MUST allow updating name, email, phone, address, and membership. The system MUST NOT allow updating documentNumber (immutable). The system MUST return 404 if client not found or soft-deleted.

#### Scenario: Update client details

- GIVEN client "client-123" exists and staff is authenticated
- WHEN PUT /clients/client-123 with {name: "Juan Actualizado", phone: "555-9999"}
- THEN system MUST return 200 status and update client in database

#### Scenario: Update document number (should fail)

- GIVEN client "client-123" exists
- WHEN PUT /clients/client-123 with {documentNumber: "99999999"}
- THEN system MUST return 400 status with error "Document number cannot be changed"

#### Scenario: Update with duplicate email

- GIVEN client "client-123" has email "old@email.com", and client "client-456" has email "new@email.com"
- WHEN PUT /clients/client-123 with {email: "new@email.com"}
- THEN system MUST return 409 status with error "Email already in use"

### Requirement: Delete Client (Admin Only, Soft Delete)

The system MUST provide a DELETE endpoint at `/clients/:id` that soft-deletes clients. The system MUST require admin role only. The system MUST set `deletedAt` to current timestamp. The system MUST return 404 if client already soft-deleted. The system MUST allow deletion even if client has sales history (maintain referential integrity via soft delete).

#### Scenario: Admin soft-deletes client

- GIVEN admin is authenticated and client "client-123" exists (deletedAt is null)
- WHEN DELETE /clients/client-123 with admin token
- THEN system MUST return 200 status, set deletedAt to current timestamp, and client no longer appears in GET /clients

#### Scenario: Staff tries to delete client

- GIVEN staff is authenticated
- WHEN DELETE /clients/client-123
- THEN system MUST return 403 status with error "Insufficient permissions"

#### Scenario: Delete already deleted client

- GIVEN client "client-456" has deletedAt set
- WHEN DELETE /clients/client-456 with admin token
- THEN system MUST return 404 status with error "Client not found"

### Requirement: Client-Sales Relationship

The system MUST allow linking sales to clients via `clientId` in POST /sales. The system MUST return client data when fetching sale details (GET /sales/:id). The system MUST NOT delete client if cascade delete is not configured (soft delete only). The system MUST maintain referential integrity: soft-deleted clients still appear in historical sales.

#### Scenario: Sale linked to client

- GIVEN client "client-123" exists
- WHEN POST /sales with {clientId: "client-123", items: [...]} with staff token
- THEN system MUST return 201 status and sale record MUST include clientId

#### Scenario: Get sale shows client info

- GIVEN sale "sale-123" is linked to client "client-123"
- WHEN GET /sales/sale-123 with staff token
- THEN system MUST return 200 status with sale data including client name and document number
