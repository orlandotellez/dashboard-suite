# Auth - Sistema de Autenticación

## Visión General

Sistema de autenticación y gestión de sesión para el CRM. Aunque el proyecto usa datos mock en memoria, se estructura como si fuera real.

---

## Flujo de Usuario

### Login
- Email + Contraseña
- "Recordarme" checkbox
- Olvidé mi contraseña (solo UI)

### Sesión
- Usuario persistido en localStorage
- Refresh automático de sesión
- Logout con confirmación

---

## Estructura de Usuario

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar: string; // initials
  role: 'admin' | 'manager' | 'vendedor' | 'readonly';
  team?: string;
  active: boolean;
  createdAt: Date;
  lastLogin: Date;
}
```

---

## Mock Data - Equipo

| Nombre | Email | Rol | Avatar BG |
|--------|-------|-----|-----------|
| Ana García | ana@agenciapro.com | Admin | #2563EB |
| Carlos López | carlos@agenciapro.com | Manager | #7C3AED |
| María Santos | maria@agenciapro.com | Vendedor | #16A34A |
| Pedro Ruiz | pedro@agenciapro.com | Vendedor | #D97706 |
| Laura Chen | laura@agenciapro.com | Vendedor | #059669 |
| Miguel Torres | miguel@agenciapro.com | Solo lectura | #6B7280 |
| Sofía Reyes | sofia@agenciapro.com | Vendedor | #DC2626 |
| Diego Vargas | diego@agenciapro.com | Manager | #7C3AED |

---

## Workspace

- Nombre: "Agencia Pro"
- Plan: Enterprise (simulado)
- Users: 8 miembros

---

## Notas

- Sin backend real, login solo valida contra mock data
- Sesión guardada en localStorage
- Logout limpia sesión y redirige a login