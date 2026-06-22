# Clientes Module Specification

## Purpose
Gestionar la base de datos de clientes de la farmacia para asociarlos a ventas y seguimiento.

## Requirements

### Requirement: Registro de Cliente
El sistema MUST permitir registrar clientes con datos: nombre, DNI, teléfono, email y dirección.

#### Scenario: Alta de cliente
- GIVEN no existe un cliente con el mismo DNI
- WHEN el usuario completa el formulario de cliente
- THEN el cliente se agrega al store con ID único

#### Scenario: DNI duplicado
- GIVEN ya existe un cliente con el DNI ingresado
- WHEN el usuario intenta registrar el cliente
- THEN el sistema MUST rechazar el alta y mostrar error de duplicado

### Requirement: Búsqueda de Clientes
El sistema MUST permitir buscar clientes por nombre o DNI de forma instantánea.

#### Scenario: Búsqueda por DNI
- GIVEN existen clientes en el store
- WHEN el usuario ingresa un DNI en el buscador
- THEN se muestran solo los clientes cuyo DNI coincida

#### Scenario: Búsqueda sin resultados
- GIVEN no hay clientes con el término "ZZZ999"
- WHEN el usuario busca "ZZZ999"
- THEN la lista debe mostrarse vacía con mensaje "No se encontraron clientes"
