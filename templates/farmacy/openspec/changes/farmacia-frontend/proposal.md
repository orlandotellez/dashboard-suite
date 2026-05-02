# Proposal: Completar Dashboard Farmacia

## Intent

Completar el dashboard de farmacia implementando todos los módulos faltantes (Inventario, Ventas, Clientes, Reportes, Proveedores, Laboratorios) para reemplazar los placeholders actuales con páginas funcionales.

## Scope

### In Scope
- Crear stores separados por dominio usando Zustand (Inventario, Ventas, Clientes, Proveedores, Laboratorios).
- Implementar páginas reales en `src/pages/` para cada módulo.
- Agregar rutas faltantes (`/proveedores`, `/laboratorios`) en `src/routes/index.tsx`.
- Actualizar `Sidebar.tsx` con nuevos ítems de navegación.
- Crear componentes específicos por módulo (tablas, formularios).
- Aprovechar `recharts` para el módulo de Reportes.

### Out of Scope
- Integración con backend real (se mantiene mock data en Zustand).
- Implementación de testing (infraestructura no detectada).
- Migración a Feature-based architecture (Approach 3).
- Validación de formularios con librerías externas (ej. react-hook-form).

## Capabilities

### New Capabilities
- `inventario-module`: Gestión de medicamentos (CRUD, stock, alertas).
- `ventas-module`: Registro de transacciones de venta y cálculo de totales.
- `clientes-module`: Gestión de base de datos de clientes.
- `reportes-module`: Visualización de gráficos y estadísticas de ventas/inventario.
- `proveedores-module`: Gestión de contactos y proveedores de medicamentos.
- `laboratorios-module`: Gestión de laboratorios y marcas de medicamentos.

### Modified Capabilities
None

## Approach

Se elige el **Approach 2 (Stores separados por dominio)** recomendado en la exploración.
- **Justificación**: No rompe el `usePharmacyStore.ts` actual (usado por Dashboard), alinea con el diseño de Zustand para múltiples stores y permite escalabilidad controlada. Cada módulo gestiona su propio estado y mock data de forma aislada.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/routes/index.tsx` | Modified | Agregar rutas `/proveedores`, `/laboratorios` y reemplazar imports de páginas placeholder. |
| `src/components/Sidebar.tsx` | Modified | Agregar ítems de menú para Proveedores y Laboratorios con iconos de `lucide-react`. |
| `src/store/` | New | Crear `useInventarioStore.ts`, `useVentasStore.ts`, `useClientesStore.ts`, `useProveedoresStore.ts`, `useLaboratoriosStore.ts`. |
| `src/pages/` | New | Crear `InventarioPage.tsx`, `VentasPage.tsx`, `ClientesPage.tsx`, `ReportesPage.tsx`, `ProveedoresPage.tsx`, `LaboratoriosPage.tsx`. |
| `src/components/` | New | Crear componentes específicos: `ProveedorForm.tsx`, `LaboratorioForm.tsx`, `VentaForm.tsx`, tablas modulares. |
| `src/index.css` | Modified | Extender con estilos para formularios, modales y componentes nuevos. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Mock data hardcodeado en stores crece sin control | High | Centralizar mocks en archivos separados o fixtures en el futuro. |
| `index.css` crece descontroladamente (~268 líneas actuales) | Medium | Monitorear tamaño; considerar CSS Modules si supera las 500 líneas. |
| No hay tests de regresión | High | Documentar la necesidad de infraestructura de testing para el futuro. |
| React Router v7 tiene diferencias con v6 | Low | Verificar compatibilidad al agregar rutas anidadas o loaders. |

## Rollback Plan

1. **Stores**: Mantener copia de `usePharmacyStore.ts` original. Si un nuevo store falla, revertir importaciones a placeholders.
2. **Pages**: Los archivos nuevos en `pages/` son aditivos; si fallan, se pueden borrar y dejar los placeholders en `routes/index.tsx`.
3. **CSS**: Si los estilos rompen el layout, revertir cambios en `index.css` usando git checkout.

## Dependencies

- Zustand v5 (ya instalado)
- lucide-react (iconos)
- recharts (gráficos)

## Success Criteria

- [ ] Todas las rutas definidas en `routes/index.tsx` cargan páginas reales (no placeholders).
- [ ] Sidebar muestra todos los ítems (Dashboard, Inventario, Ventas, Clientes, Reportes, Proveedores, Laboratorios).
- [ ] Cada módulo tiene su propio store en `src/store/` funcionando con mock data.
- [ ] El dashboard original se mantiene intacto y funcional.
