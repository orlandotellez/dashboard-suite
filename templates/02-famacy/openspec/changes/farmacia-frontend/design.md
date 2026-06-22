# Design: Completar Dashboard Farmacia

## Technical Approach

Implementar 6 módulos funcionales (Inventario, Ventas, Clientes, Reportes, Proveedores, Laboratorios) usando Zustand stores separados por dominio. Cada módulo tiene su propio store en `src/store/`, página en `src/pages/` y componentes en `src/components/`. Se reutiliza la estructura CSS existente y se integran lucide-react y recharts.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Store único (monolítico) | Menos archivos, pero acopla dominios | Rejected |
| Feature-based folders | Mejor encapsulación, pero rompe estructura actual | Rejected |
| **Stores separados por dominio** | **Aislados, escalables, no rompen usePharmacyStore** | **Chosen** |
| **Carpetas actuales (components/pages/store)** | **Estructura establecida, clara para 6 módulos** | **Chosen** |

## Data Flow

```
Page.tsx ──→ Store (state + actions) ──→ UI Render
```

Ejemplo para Ventas:
```
VentasPage.tsx ──→ useVentasStore.ts (ventas[], cart[], addVenta())
       │                        │
       └─── VentaForm.tsx ─────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `dashboard-farmacia/src/store/useInventarioStore.ts` | Create | CRUD medicamentos, alertas stock |
| `dashboard-farmacia/src/store/useVentasStore.ts` | Create | Ventas, carrito, cálculos IVA 21% |
| `dashboard-farmacia/src/store/useClientesStore.ts` | Create | Gestión clientes, búsqueda por DNI |
| `dashboard-farmacia/src/store/useProveedoresStore.ts` | Create | Gestión proveedores, CUIT único |
| `dashboard-farmacia/src/store/useLaboratoriosStore.ts` | Create | Catálogo laboratorios |
| `dashboard-farmacia/src/store/useReportesStore.ts` | Create | Datos agregados para recharts |
| `dashboard-farmacia/src/pages/InventarioPage.tsx` | Create | Reemplaza placeholder |
| `dashboard-farmacia/src/pages/VentasPage.tsx` | Create | Reemplaza placeholder |
| `dashboard-farmacia/src/pages/ClientesPage.tsx` | Create | Reemplaza placeholder |
| `dashboard-farmacia/src/pages/ReportesPage.tsx` | Create | Reemplaza placeholder, gráficos |
| `dashboard-farmacia/src/pages/ProveedoresPage.tsx` | Create | Nueva página |
| `dashboard-farmacia/src/pages/LaboratoriosPage.tsx` | Create | Nueva página |
| `dashboard-farmacia/src/components/ProveedorForm.tsx` | Create | Formulario proveedores |
| `dashboard-farmacia/src/components/LaboratorioForm.tsx` | Create | Formulario laboratorios |
| `dashboard-farmacia/src/components/VentaForm.tsx` | Create | Formulario ventas + carrito |
| `dashboard-farmacia/src/components/ClienteForm.tsx` | Create | Formulario clientes |
| `dashboard-farmacia/src/components/ReporteChart.tsx` | Create | Gráficos recharts |
| `dashboard-farmacia/src/routes/index.tsx` | Modify | Agregar `/proveedores`, `/laboratorios` |
| `dashboard-farmacia/src/components/Sidebar.tsx` | Modify | Agregar 2 ítems con lucide-react |
| `dashboard-farmacia/src/index.css` | Modify | Estilos formularios, tablas, badges |

## Interfaces / Contracts

```typescript
// Medicine expandido (principioActivo y laboratorioId nuevos)
export interface Medicine {
  id: string
  name: string
  principioActivo: string
  laboratorioId: string
  stock: number
  minStock: number
  price: number
  category: string
}

export interface Venta {
  id: string
  clienteId: string
  items: VentaItem[]
  subtotal: number
  impuestos: number  // IVA 21%
  total: number
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia'
  fecha: Date
}

export interface VentaItem {
  medicamentoId: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Cliente {
  id: string
  nombre: string
  dni: string
  telefono: string
  email: string
  direccion: string
}

export interface Proveedor {
  id: string
  nombreEmpresa: string
  cuit: string
  telefono: string
  email: string
  direccion: string
  nombreContacto: string
}

export interface Laboratorio {
  id: string
  nombre: string
  paisOrigen: string
  sitioWeb: string
  telefono: string
}
```

### Zustand Store States y Actions (resumen)

```typescript
// useInventarioStore: medicines[], searchQuery, add/update/deleteMedicine(), getFilteredMedicines(), getLowStockMedicines()
// useVentasStore: ventas[], cart[], addToCart(), removeFromCart(), clearCart(), confirmVenta(), getCartTotal()
// useClientesStore: clientes[], searchQuery, add/update/deleteCliente(), getFilteredClientes()
// useProveedoresStore: proveedores[], add/update/deleteProveedor()
// useLaboratoriosStore: laboratorios[], add/update/deleteLaboratorio(force?)
// useReportesStore: getVentasByDateRange(), getVentasByMedicamento(), getVentasDiarias()
```

## Routing

En `dashboard-farmacia/src/routes/index.tsx`:

```typescript
// Agregar imports:
import { ProveedoresPage } from '../pages/ProveedoresPage'
import { LaboratoriosPage } from '../pages/LaboratoriosPage'

// Agregar rutas:
<Route path="/proveedores" element={<ProveedoresPage />} />
<Route path="/laboratorios" element={<LaboratoriosPage />} />

// Reemplazar placeholders de Inventario, Ventas, Clientes, Reportes con imports reales
```

## UI/UX

- **CSS**: Reutilizar variables CSS existentes (`--color-*`) en `index.css`. Agregar clases para `.form-group`, `.btn-primary`, `.table-responsive`.
- **Iconos**: Usar `lucide-react` (ya en Sidebar). Nuevos ítems: `Truck` (Proveedores), `FlaskConical` (Laboratorios).
- **Gráficos**: `recharts` para Reportes (BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend).

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Store actions (add, update, delete) | Manual (no test infra detected) |
| Integration | Form → Store → Table render | Manual |
| E2E | Flujo completo de venta | Manual |

## Migration / Rollout

No migration required. Los stores usan mock data en memoria. Si se migra a backend real, solo cambiarían las acciones de los stores para hacer fetch/API calls.

## Open Questions

- [ ] ¿Se debe persistir el estado en localStorage para simular persistencia?
- [ ] ¿El Dashboard debe mostrar datos agregados de los nuevos stores o mantener su mock data actual?
