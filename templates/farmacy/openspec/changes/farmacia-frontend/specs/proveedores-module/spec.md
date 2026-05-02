# Proveedores Module Specification

## Purpose
Gestionar la información de contacto y datos comerciales de los proveedores de medicamentos.

## Requirements

### Requirement: Gestión de Contactos
El sistema MUST permitir registrar y editar proveedores con campos: nombre de empresa, CUIT, teléfono, email, dirección y nombre de contacto.

#### Scenario: Alta de proveedor
- GIVEN no existe un proveedor con el mismo CUIT
- WHEN el usuario completa el formulario de proveedor
- THEN el proveedor se agrega al store con ID único

#### Scenario: Edición de datos de contacto
- GIVEN existe un proveedor con ID conocido
- WHEN el usuario actualiza el teléfono y email
- THEN los cambios se persisten en el store

#### Scenario: CUIT duplicado
- GIVEN ya existe un proveedor con CUIT "30-12345678-9"
- WHEN se intenta dar de alta otro con el mismo CUIT
- THEN el sistema MUST rechazar la operación y mostrar error

### Requirement: Listado de Proveedores
El sistema SHOULD mostrar un listado paginado o scrollable de todos los proveedores registrados.

#### Scenario: Visualización de listado
- GIVEN hay 15 proveedores en el store
- WHEN el usuario accede a la página de proveedores
- THEN se muestra la lista con nombre, CUIT y teléfono visible
