# Inventario Module Specification

## Purpose
Gestionar el catálogo de medicamentos: altas, bajas, modificaciones y control de stock mínimo.

## Requirements

### Requirement: Medicamento CRUD
El sistema MUST permitir crear, leer, actualizar y eliminar medicamentos con campos: nombre, principio activo, laboratorio, stock actual, stock mínimo y precio.

#### Scenario: Alta de medicamento
- GIVEN no existe un medicamento con el mismo nombre y laboratorio
- WHEN el usuario completa el formulario con datos válidos
- THEN el medicamento se agrega al store con ID único

#### Scenario: Edición de medicamento
- GIVEN existe un medicamento con ID conocido
- WHEN el usuario modifica sus datos y guarda
- THEN el store refleja los cambios actualizados

#### Scenario: Eliminación de medicamento
- GIVEN existe un medicamento con ID conocido
- WHEN el usuario confirma la eliminación
- THEN el medicamento se remueve del store

### Requirement: Alertas de Stock
El sistema MUST marcar medicamentos cuyo stock actual sea menor o igual al stock mínimo configurado.

#### Scenario: Alerta por stock bajo
- GIVEN un medicamento tiene stock actual = 5 y stock mínimo = 10
- WHEN se renderiza la lista de inventario
- THEN el medicamento se muestra con indicador visual de alerta

#### Scenario: Sin alerta si stock suficiente
- GIVEN un medicamento tiene stock actual = 50 y stock mínimo = 10
- WHEN se renderiza la lista de inventario
- THEN el medicamento NO muestra indicador de alerta
