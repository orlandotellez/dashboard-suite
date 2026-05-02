# Tasks: Completar Dashboard Farmacia

## Phase 1: Infraestructura (Stores y Tipos)
- [x] 1.1 Create `src/types/pharmacy.ts` (Medicine, Venta, Cliente, Proveedor, Laboratorio)
- [x] 1.2 Create `useInventarioStore.ts` (CRUD medicines, low stock)
- [x] 1.3 Create `useVentasStore.ts` (cart, confirmVenta, IVA 21%)
- [x] 1.4 Create `useClientesStore.ts` (CRUD, search DNI)
- [x] 1.5 Create `useProveedoresStore.ts` (CRUD, CUIT unique)
- [x] 1.6 Create `useLaboratoriosStore.ts` (CRUD, delete check)
- [x] 1.7 Create `useReportesStore.ts` (ventas by date/medicamento)

## Phase 2: Componentes Compartidos
- [x] 2.1 Create `DataTable.tsx` reusable table with search
- [x] 2.2 Create `FormModal.tsx` modal wrapper for forms
- [x] 2.3 Create `SearchInput.tsx` instant filter

## Phase 3: Módulo por Módulo
- [x] 3.1 Inventario: `MedicineForm.tsx` + `InventarioTable.tsx` + `InventarioPage.tsx`
- [x] 3.2 Ventas: `VentaForm.tsx` (cart, IVA) + `VentasTable.tsx` + `VentasPage.tsx`
- [x] 3.3 Clientes: `ClienteForm.tsx` (DNI) + `ClientesTable.tsx` + `ClientesPage.tsx`
- [x] 3.4 Reportes: `ReporteChart.tsx` (recharts) + `ReportesPage.tsx`
- [x] 3.5 Proveedores: `ProveedorForm.tsx` (CUIT) + `ProveedoresTable.tsx` + `ProveedoresPage.tsx`
- [x] 3.6 Laboratorios: `LaboratorioForm.tsx` + `LaboratoriosTable.tsx` + `LaboratoriosPage.tsx`

## Phase 4: Integración
- [x] 4.1 Update `routes/index.tsx`: real pages, add /proveedores, /laboratorios
- [x] 4.2 Update `Sidebar.tsx`: Truck (Proveedores), FlaskConical (Laboratorios)
- [x] 4.3 Verify DashboardPage with usePharmacyStore intact

## Phase 5: Estilos y Pulido
- [x] 5.1 Update `index.css`: .form-group, .table-responsive, .badge-alert
- [x] 5.2 Manual test: venta flow (select → cart → confirm → stock check)
- [x] 5.3 Manual test: low stock alerts in inventario
