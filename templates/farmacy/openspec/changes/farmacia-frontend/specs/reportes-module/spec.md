# Reportes Module Specification

## Purpose
Visualizar estadísticas y tendencias de ventas e inventario mediante gráficos interactivos.

## Requirements

### Requirement: Filtros por Fecha
El sistema MUST permitir filtrar las ventas mostradas en el reporte mediante un rango de fechas.

#### Scenario: Filtrar ventas del mes actual
- GIVEN existen ventas en enero y febrero
- WHEN el usuario selecciona rango "01/01/2026" a "31/01/2026"
- THEN solo se muestran las ventas de enero en el reporte

#### Scenario: Sin ventas en rango
- GIVEN no hay ventas entre "01/03/2026" y "31/03/2026"
- WHEN se aplica ese filtro de fechas
- THEN el reporte debe mostrar mensaje "No hay ventas en este período"

### Requirement: Gráficos de Ventas
El sistema MUST renderizar gráficos de barras o líneas mostrando ventas diarias o mensuales usando recharts.

#### Scenario: Gráfico de ventas diarias
- GIVEN hay ventas registradas en los últimos 7 días
- WHEN el usuario visualiza la sección de reportes
- THEN se renderiza un gráfico de barras con el total por día

#### Scenario: Desglose por medicamento
- GIVEN se selecciona la vista "Por Medicamento"
- WHEN se renderiza el gráfico
- THEN el eje X muestra medicamentos y el Y el total vendido
