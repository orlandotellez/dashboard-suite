# Laboratorios Module Specification

## Purpose
Gestionar el catálogo de laboratorios y marcas fabricantes de medicamentos.

## Requirements

### Requirement: Gestión de Laboratorios
El sistema MUST permitir registrar laboratorios con campos: nombre, país de origen, sitio web y teléfono.

#### Scenario: Alta de laboratorio
- GIVEN no existe un laboratorio con el mismo nombre
- WHEN el usuario completa el formulario de laboratorio
- THEN el laboratorio se agrega al store con ID único

#### Scenario: Edición de laboratorio
- GIVEN existe un laboratorio con ID conocido
- WHEN el usuario modifica el país de origen
- THEN el cambio se refleja en el store

#### Scenario: Eliminación con medicamentos asociados
- GIVEN un laboratorio tiene medicamentos en inventario
- WHEN el usuario intenta eliminarlo
- THEN el sistema MUST advertir y permitir confirmación o cancelación

### Requirement: Asociación con Medicamentos
El sistema SHOULD permitir filtrar medicamentos en inventario por laboratorio fabricante.

#### Scenario: Filtrar medicamentos por laboratorio
- GIVEN "Laboratorio A" tiene 5 medicamentos en inventario
- WHEN el usuario selecciona "Laboratorio A" en el filtro
- THEN solo se muestran esos 5 medicamentos en la lista

#### Scenario: Laboratorio sin medicamentos
- GIVEN "Laboratorio Nuevo" no tiene medicamentos asociados
- WHEN se filtra por ese laboratorio
- THEN la lista debe mostrarse vacía
