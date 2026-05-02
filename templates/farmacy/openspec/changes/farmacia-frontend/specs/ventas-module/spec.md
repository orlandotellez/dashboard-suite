# Ventas Module Specification

## Purpose
Registrar transacciones de venta, gestionar el carrito de compra y calcular totales en tiempo real.

## Requirements

### Requirement: Registro de Venta
El sistema MUST permitir seleccionar medicamentos del inventario, especificar cantidades y registrar una venta completa.

#### Scenario: Venta exitosa
- GIVEN hay stock suficiente para los medicamentos seleccionados
- WHEN el usuario confirma la venta con cliente y método de pago
- THEN se crea la venta, se descuenta el stock y se limpia el carrito

#### Scenario: Venta con stock insuficiente
- GIVEN un medicamento en el carrito tiene cantidad > stock actual
- WHEN el usuario intenta confirmar la venta
- THEN el sistema MUST bloquear la operación y mostrar error específico

### Requirement: Cálculo de Totales
El sistema MUST calcular subtotal, impuestos (IVA 21%) y total de la venta en tiempo real.

#### Scenario: Cálculo correcto de total
- GIVEN el carrito tiene 2 unidades de "Paracetamol" a $100 y 1 de "Ibuprofeno" a $200
- WHEN se visualiza el resumen de la venta
- THEN el subtotal es $400, IVA $84 y total $484

#### Scenario: Carrito vacío
- GIVEN el carrito no tiene medicamentos
- WHEN se visualiza el resumen
- THEN subtotal, IVA y total deben mostrarse como $0
