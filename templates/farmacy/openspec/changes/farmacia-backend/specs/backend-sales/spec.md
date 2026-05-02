# Backend-Sales Specification

## Purpose

Sales transaction module for farmacia backend. Handles recording medicine sales with automatic stock deduction using Prisma transactions. Ensures data consistency: sale record and stock update either both succeed or both fail.

## Requirements

### Requirement: Register Sale (Admin/Staff Only)

The system MUST provide a POST endpoint at `/sales` that registers a new sale. The system MUST require admin or staff role. The system MUST accept sale data with: clientId (optional), items array (medicineId, quantity, unitPrice), paymentMethod, and total amount. The system MUST validate that all medicines exist and have sufficient stock. The system MUST use Prisma transaction to: create sale record, create sale items, and decrement medicine stock. The system MUST return 400 if any medicine has insufficient stock.

#### Scenario: Successful sale registration

- GIVEN staff is authenticated, medicine "med-123" has stock 50, and sale data is {items: [{medicineId: "med-123", quantity: 2, unitPrice: 12.50}], total: 25.00, paymentMethod: "cash"}
- WHEN POST /sales with valid JWT and sale data
- THEN system MUST return 201 status, create sale record, create sale items, and decrement medicine "med-123" stock to 48

#### Scenario: Sale with insufficient stock

- GIVEN medicine "med-123" has stock 3
- WHEN POST /sales with {items: [{medicineId: "med-123", quantity: 5, unitPrice: 12.50}]}
- THEN system MUST return 400 status with error "Insufficient stock for medicine: med-123 (available: 3, requested: 5)"

#### Scenario: Sale with non-existent medicine

- GIVEN no medicine exists with ID "med-nonexistent"
- WHEN POST /sales with {items: [{medicineId: "med-nonexistent", quantity: 1}]}
- THEN system MUST return 400 status with error "Medicine not found: med-nonexistent"

#### Scenario: Sale transaction rollback on error

- GIVEN medicine "med-123" has stock 10, and database error occurs during stock update
- WHEN POST /sales with valid sale data
- THEN system MUST return 500 status, NO sale record created, and stock remains unchanged (transaction rolled back)

#### Scenario: Customer tries to register sale

- GIVEN customer is authenticated
- WHEN POST /sales with valid sale data
- THEN system MUST return 403 status with error "Insufficient permissions"

### Requirement: List Sales (Admin/Staff Only)

The system MUST provide a GET endpoint at `/sales` that returns all sales records. The system MUST require admin or staff role. The system MUST support filtering by date range (`startDate`, `endDate`), clientId, and paymentMethod. The system MUST support pagination with `page` and `limit`. The system MUST return sale data with items included (medicine details, quantities, prices).

#### Scenario: List all sales

- GIVEN staff is authenticated and 10 sales exist in database
- WHEN GET /sales with valid JWT
- THEN system MUST return 200 status with array of sales (id, date, total, paymentMethod, client name, items count)

#### Scenario: Filter sales by date range

- GIVEN sales exist on 2026-05-01 and 2026-05-02
- WHEN GET /sales?startDate=2026-05-01&endDate=2026-05-01 with staff token
- THEN system MUST return 200 status with only sales from May 1st, 2026

#### Scenario: Filter sales by client

- GIVEN client "client-123" has 3 sales
- WHEN GET /sales?clientId=client-123 with staff token
- THEN system MUST return 200 status with only sales for that client

#### Scenario: Paginated sales list

- GIVEN 45 sales exist in database
- WHEN GET /sales?page=2&limit=20 with staff token
- THEN system MUST return 200 status with sales 21-40 and pagination metadata

### Requirement: Get Sale by ID (Admin/Staff Only)

The system MUST provide a GET endpoint at `/sales/:id` that returns sale details with all items. The system MUST require admin or staff role. The system MUST return 404 if sale not found.

#### Scenario: Get existing sale with items

- GIVEN sale "sale-123" exists with 3 items
- WHEN GET /sales/sale-123 with staff token
- THEN system MUST return 200 status with sale details and items array (medicine name, quantity, unitPrice, subtotal)

#### Scenario: Get non-existent sale

- GIVEN no sale exists with ID "sale-nonexistent"
- WHEN GET /sales/sale-nonexistent with staff token
- THEN system MUST return 404 status with error "Sale not found"

### Requirement: Sales Stock Consistency

The system MUST ensure that stock deduction is atomic with sale creation. The system MUST use Prisma `$transaction()` to wrap: create sale, create sale items, and update medicine stocks. The system MUST verify stock availability BEFORE attempting transaction. The system MUST NOT allow negative stock under any circumstance.

#### Scenario: Concurrent sales same medicine (race condition)

- GIVEN medicine "med-123" has stock 5, and two simultaneous sales request 3 units each
- WHEN both POST /sales arrive concurrently
- THEN system MUST ensure only ONE sale succeeds (stock 5 - 3 = 2), and the other fails with "Insufficient stock" (database constraint or transaction isolation)

#### Scenario: Sale with multiple items

- GIVEN medicines "med-1" has stock 10, "med-2" has stock 20
- WHEN POST /sales with {items: [{medicineId: "med-1", quantity: 3}, {medicineId: "med-2", quantity: 5}]}
- THEN system MUST return 201 status, create sale with 2 items, decrement med-1 stock to 7, decrement med-2 stock to 15
