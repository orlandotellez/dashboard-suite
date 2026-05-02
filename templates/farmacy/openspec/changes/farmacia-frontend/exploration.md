## Exploration: Agregar módulos a dashboard-farmacia

### Current State

**Stack confirmado:**
- React 19 + TypeScript 5.9 + Vite 7
- State: Zustand v5 (`src/store/usePharmacyStore.ts`)
- Routing: React Router DOM v7 (`src/routes/index.tsx`)
- UI: lucide-react (iconos), recharts (gráficos)
- Estilos: CSS plano con custom properties (`src/index.css`) — NO CSS-in-JS

**Estructura actual de `src/`:**
```
src/
├── App.tsx                    # Entry: importa AppRoutes
├── main.tsx                   # ReactDOM.createRoot, importa index.css
├── index.css                  # ~268 líneas, variables CSS en :root
├── components/
│   ├── Sidebar.tsx            # Menú de navegación (lucide icons)
│   ├── StatCard.tsx           # Tarjeta de KPI reutilizable
│   ├── MedicineTable.tsx      # Tabla de medicamentos (usa store)
│   └── InventoryAlerts.tsx    # Alertas de stock bajo (usa store)
├── pages/
│   └── DashboardPage.tsx      # Dashboard completo: KPIs + gráfico + tabla
├── routes/
│   └── index.tsx              # BrowserRouter + Routes (5 rutas)
└── store/
    └── usePharmacyStore.ts    # Zustand store + mock data
```

**Estado de las rutas actuales (`src/routes/index.tsx`):**
- `/` → `DashboardPage` (implementado completo)
- `/inventario` → `InventarioPage` (**placeholder** — `<div><h1>Inventario</h1>...</div>`)
- `/ventas` → `VentasPage` (**placeholder**)
- `/clientes` → `ClientesPage` (**placeholder**)
- `/reportes` → `ReportesPage` (**placeholder**)

**Faltan rutas para:**
- Proveedores (gestión de contactos)
- Laboratorios (gestión de marcas)

**Store actual (`usePharmacyStore.ts`):**
- Interfaces: `Medicine`, `DashboardStats`
- State: `medicines[]`, `stats`, `searchQuery`
- Actions: `setSearchQuery()`, `getFilteredMedicines()`
- Mock data hardcodeado en el mismo archivo

**Patrones de diseño observados:**
1. Componentes de presentación en `components/` (StatCard es el más reutilizable)
2. Páginas completas en `pages/` (solo DashboardPage existe)
3. Store centralizado en Zustand con datos mock
4. Estilos: clases CSS personalizadas (`.stat-card`, `.data-table`, `.content-section`, etc.)
5. Iconos: imports nombrados desde `lucide-react`

---

### Affected Areas

- `src/routes/index.tsx` — Agregar rutas para Proveedores y Laboratorios, y reemplazar placeholders con páginas reales
- `src/components/Sidebar.tsx` — Agregar ítems de menú para Proveedores y Laboratorios
- `src/store/usePharmacyStore.ts` — Necesita extenderse para nuevos dominios (ventas, clientes, proveedores, laboratorios) o crear stores separados
- `src/pages/` — Crear nuevas páginas: `InventarioPage.tsx`, `VentasPage.tsx`, `ClientesPage.tsx`, `ReportesPage.tsx`, `ProveedoresPage.tsx`, `LaboratoriosPage.tsx`
- `src/components/` — Crear componentes específicos para cada módulo (tablas, formularios, filtros)
- `src/index.css` — Posiblemente extender con estilos para nuevos componentes (formularios, modales)

---

### Approaches

#### 1. **Extensión del store monolítico (Zustand single store)**
   - Mantener todo en `usePharmacyStore.ts`, agregando nuevas interfaces y state para cada módulo.
   - Pros: Consistencia con el código actual, fácil compartir estado entre módulos.
   - Cons: Archivo crecerá descontroladamente, difícil de mantener, mock data mezclado con lógica.
   - Effort: **Low** (cambios mínimos de estructura)

#### 2. **Stores separados por dominio (Zustand slices / multiple stores)**
   - Crear `useInventarioStore.ts`, `useVentasStore.ts`, `useClientesStore.ts`, etc.
   - Pros: Separación de responsabilidades, archivos pequeños, fácil mantenimiento.
   - Cons: Necesita refactorizar el store actual, posible duplicación de patrones.
   - Effort: **Medium** (refactor inicial + nuevos stores)

#### 3. **Estructura de carpetas por feature (Feature-based architecture)**
   - Reorganizar `src/` en `features/inventario/`, `features/ventas/`, etc., cada uno con sus propios `components/`, `store.ts`, `pages/`.
   - Pros: Escalabilidad máxima, alineado con Clean Architecture / Screaming Architecture.
   - Cons: Cambio estructural grande, rompe la convención actual del proyecto.
   - Effort: **High** (reestructuración completa)

---

### Recommendation

**Opción recomendada: Approach 2 (Stores separados por dominio) + mantener estructura de carpetas actual.**

Justificación:
1. **No rompe lo existente**: El `usePharmacyStore.ts` actual puede mantenerse para el Dashboard (que ya funciona), y crear nuevos stores para los otros módulos.
2. **Alineado con Zustand**: Zustand está diseñado para múltiples stores; no hay necesidad de un store monolítico.
3. **Escalabilidad controlada**: Si en el futuro se quiere migrar a feature-based folders, ya tendremos los stores separados.

**Estructura propuesta para agregar módulos:**
```
src/
├── components/
│   ├── Sidebar.tsx              # Agregar Proveedores, Laboratorios
│   ├── StatCard.tsx             # (sin cambios)
│   ├── MedicineTable.tsx        # (sin cambios - usa usePharmacyStore)
│   ├── InventoryAlerts.tsx      # (sin cambios)
│   ├── ProveedorForm.tsx        # NUEVO
│   ├── LaboratorioForm.tsx      # NUEVO
│   ├── VentaForm.tsx            # NUEVO
│   └── ...                     # Otros componentes específicos
├── pages/
│   ├── DashboardPage.tsx        # (sin cambios - usa usePharmacyStore)
│   ├── InventarioPage.tsx       # NUEVO (reemplaza placeholder)
│   ├── VentasPage.tsx           # NUEVO
│   ├── ClientesPage.tsx         # NUEVO
│   ├── ReportesPage.tsx         # NUEVO (aprovechar recharts)
│   ├── ProveedoresPage.tsx      # NUEVO
│   └── LaboratoriosPage.tsx     # NUEVO
├── routes/
│   └── index.tsx                # Agregar rutas /proveedores, /laboratorios
├── store/
│   ├── usePharmacyStore.ts      # (sin cambios - solo para Dashboard)
│   ├── useInventarioStore.ts    # NUEVO
│   ├── useVentasStore.ts        # NUEVO
│   ├── useClientesStore.ts      # NUEVO
│   ├── useProveedoresStore.ts   # NUEVO
│   └── useLaboratoriosStore.ts  # NUEVO
└── index.css                    # Agregar estilos para formularios, modales, etc.
```

**Pasos iniciales recomendados:**
1. Agregar ítems al Sidebar (`Proveedores`, `Laboratorios`) con iconos de `lucide-react` (`Truck`, `FlaskConical` o similares).
2. Crear las rutas en `routes/index.tsx` importando las nuevas páginas (o placeholders si no están listas).
3. Para **Inventario**, extender `usePharmacyStore.ts` con acciones: `addMedicine()`, `updateStock()`, `deleteMedicine()`.
4. Para **Reportes**, aprovechar `recharts` con nuevos componentes de gráficos (barras, tortas, líneas) y filtros de fecha.
5. Para **Ventas**, crear store con `transactions[]` y componentes para registrar venta (select de productos, cantidad, total).
6. Usar el patrón de `MedicineTable.tsx` para crear tablas similares para Clientes, Proveedores y Laboratorios.

---

### Risks

- **Store actual es solo mock**: Los nuevos stores también empezarán con mock data. Cuando se conecte al backend real (Node.js mencionado en config.yaml), habrá que reemplazar mocks por `fetch`/axios.
- **CSS puede crecer descontroladamente**: `index.css` ya tiene ~268 líneas. Considerar CSS Modules o separar en `styles/` si crece demasiado.
- **Placeholder pages ya existen**: En `routes/index.tsx` hay componentes inline (`InventarioPage`, etc.). Hay que reemplazarlos con imports a archivos reales en `pages/`.
- **No hay validación de formularios**: Para alta de productos, clientes, etc., se necesitará validación (considerar `react-hook-form` + `zod` en el futuro).
- **React Router v7**: El proyecto usa la v7 que tiene diferencias con v6. Verificar compatibilidad al agregar rutas anidadas o loaders si se requieren.

---

### Ready for Proposal

**Yes** — se puede proceder con la propuesta (sdd-propose).

El orquestador debe indicar al usuario:
1. Si prefiere mantener los datos en mock (Zustand local) o preparar la estructura para conectar con backend.
2. Si los módulos deben implementarse todos de una vez o en fases (ej: primero Inventario + Ventas, luego el resto).
3. Si se requieren tests (actualmente no hay infraestructura de testing detectada).
