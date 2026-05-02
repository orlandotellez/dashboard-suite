# Backend-Reports Specification

## Purpose

Reports and analytics module for farmacia backend. Provides endpoints for sales reports, top-selling medicines, and dashboard statistics. All endpoints require admin or staff authentication with RBAC.

## Requirements

### Requirement: Sales Report by Date Range (Admin/Staff Only)

The system MUST provide a GET endpoint at `/reports/sales` that returns sales statistics for a given date range. The system MUST require admin or staff role. The system MUST accept `startDate` and `endDate` query parameters (ISO 8601 format). The system MUST return: total sales count, total revenue, average sale value, sales by payment method, and daily breakdown. The system MUST return 400 if date range is invalid or exceeds 90 days.

#### Scenario: Get sales report for 7 days

- GIVEN staff is authenticated, and sales exist between 2026-04-25 and 2026-05-01
- WHEN GET /reports/sales?startDate=2026-04-25&endDate=2026-05-01 with staff token
- THEN system MUST return 200 status with {totalSales: <count>, totalRevenue: <sum>, avgSaleValue: <avg>, byPaymentMethod: {...}, dailyBreakdown: [...]}

#### Scenario: Report with no sales in range

- GIVEN no sales exist between 2026-01-01 and 2026-01-07
- WHEN GET /reports/sales?startDate=2026-01-01&endDate=2026-01-07 with staff token
- THEN system MUST return 200 status with {totalSales: 0, totalRevenue: 0, avgSaleValue: 0, dailyBreakdown: []}

#### Scenario: Invalid date range (end before start)

- GIVEN GET /reports/sales?startDate=2026-05-10&endDate=2026-05-01
- WHEN system validates date parameters
- THEN system MUST return 400 status with error "Invalid date range: end date must be after start date"

#### Scenario: Date range exceeds 90 days

- GIVEN GET /reports/sales?startDate=2026-01-01&endDate=2026-05-01 (121 days)
- WHEN system validates date range
- THEN system MUST return 400 status with error "Date range cannot exceed 90 days"

#### Scenario: Customer tries to access report

- GIVEN customer is authenticated
- WHEN GET /reports/sales?startDate=2026-05-01&endDate=2026-05-01
- THEN system MUST return 403 status with error "Insufficient permissions"

### Requirement: Top Medicines Report (Admin/Staff Only)

The system MUST provide a GET endpoint at `/reports/top-medicines` that returns best-selling medicines. The system MUST require admin or staff role. The system MUST accept `startDate`, `endDate`, and `limit` query parameters. The system MUST return medicines sorted by total quantity sold, including: medicine details, total quantity sold, total revenue, and number of transactions. The system MUST limit results to `limit` parameter (default 10, max 50).

#### Scenario: Get top 5 medicines by quantity sold

- GIVEN staff is authenticated, and medicine "Ibuprofeno" sold 150 units, "Paracetamol" sold 120 units in date range
- WHEN GET /reports/top-medicines?startDate=2026-04-01&endDate=2026-04-30&limit=5 with staff token
- THEN system MUST return 200 status with array of 5 medicines sorted by quantity descending, first element {medicine: "Ibuprofeno", totalSold: 150, revenue: <sum>, transactions: <count>}

#### Scenario: Top medicines with no sales

- GIVEN no sales exist in specified date range
- WHEN GET /reports/top-medicines?startDate=2026-01-01&endDate=2026-01-31 with staff token
- THEN system MUST return 200 status with empty array []

#### Scenario: Limit exceeds maximum

- GIVEN GET /reports/top-medicines?limit=100
- WHEN system validates limit parameter
- THEN system MUST return 400 status with error "Limit cannot exceed 50"

### Requirement: Dashboard Summary Report (Admin/Staff Only)

The system MUST provide a GET endpoint at `/reports/dashboard` that returns summary statistics for dashboard widgets. The system MUST require admin or staff role. The system MUST return: total medicines count (active), low stock count, total clients count, sales today, sales this month, and revenue this month. The system MUST calculate these in real-time from database.

#### Scenario: Get dashboard summary

- GIVEN staff is authenticated, 45 active medicines exist, 3 with low stock, 30 clients, 5 sales today, 80 sales this month
- WHEN GET /reports/dashboard with staff token
- THEN system MUST return 200 status with {totalMedicines: 45, lowStockCount: 3, totalClients: 30, salesToday: 5, salesThisMonth: 80, revenueThisMonth: <sum>}

#### Scenario: Empty database summary

- GIVEN no medicines, clients, or sales exist
- WHEN GET /reports/dashboard with staff token
- THEN system MUST return 200 status with all zeros: {totalMedicines: 0, lowStockCount: 0, totalClients: 0, salesToday: 0, salesThisMonth: 0, revenueThisMonth: 0}

### Requirement: Stock Status Report (Admin/Staff Only)

The system MUST provide a GET endpoint at `/reports/stock-status` that returns medicines grouped by stock level. The system MUST require admin or staff role. The system MUST return counts and lists for: out of stock (stock = 0), low stock (stock < 10), adequate stock (10 <= stock < 50), well stocked (stock >= 50). The system MUST support optional `categoryId` filter.

#### Scenario: Get stock status overview

- GIVEN staff is authenticated, medicines exist with various stock levels
- WHEN GET /reports/stock-status with staff token
- THEN system MUST return 200 status with {outOfStock: {count: 2, items: [...]}, lowStock: {count: 5, items: [...]}, adequateStock: {count: 15, items: [...]}, wellStocked: {count: 8, items: [...]}}

#### Scenario: Filter by category

- GIVEN category "Analgesics" has 10 medicines with various stock levels
- WHEN GET /reports/stock-status?categoryId=cat-analgesics with staff token
- THEN system MUST return 200 status with only medicines from that category grouped by stock level

### Requirement: Report Performance

The system MUST ensure report endpoints complete within 2 seconds for datasets up to 10,000 sales records. The system MUST use Prisma aggregation functions (`groupBy`, `sum`, `count`) for efficient queries. The system MUST use database indexes on `sale.date`, `saleItem.medicineId`, and `medicine.stock` for optimal performance.

#### Scenario: Large dataset report performance

- GIVEN 10,000 sales exist in date range
- WHEN GET /reports/sales?startDate=2026-01-01&endDate=2026-12-31 with staff token
- THEN system MUST return 200 status within 2 seconds (measured server-side)

#### Scenario: Top medicines with large dataset

- GIVEN 50 medicines with 10,000+ sale items each
- WHEN GET /reports/top-medicines?startDate=2026-01-01&endDate=2026-12-31&limit=10 with staff token
- THEN system MUST return 200 status within 2 seconds
