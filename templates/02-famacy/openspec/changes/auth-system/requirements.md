# Requerimientos: Sistema de Autenticación y Autorización (Simulado)

## 1. Autenticación
Se debe implementar un sistema completo de:
- Registro de usuarios.
- Inicio de sesión (login).
- Cierre de sesión (logout).
- Manejo de sesión segura (simulación de tokens JWT en Zustand/localStorage).

## 2. Autorización basada en roles
El sistema debe ser RBAC (Role-Based Access Control) con los siguientes roles:
- **admin**: acceso total al sistema, incluyendo gestión de usuarios.
- **staff**: acceso a funcionalidades internas según permisos definidos.
- **customer**: acceso limitado a funcionalidades de usuario final.

## 3. Gestión de usuarios
- Solo los usuarios con rol **admin** podrán crear, editar, eliminar y listar usuarios.
- Los roles deben poder ser asignados y modificados únicamente por administradores.

## 4. Perfil de usuario
En el dashboard debe existir una sección de perfil donde el usuario pueda:
- Ver su información personal.
- Ver su rol asignado.
- (Opcional) editar datos básicos como nombre o contraseña.

## 5. Dashboard
- Mostrar información relevante del usuario autenticado.
- Incluir acceso al perfil.
- Adaptar la interfaz según el rol del usuario (admin/staff/customer).
