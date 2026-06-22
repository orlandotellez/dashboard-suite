# RBAC - Control de Acceso Basado en Roles

## Visión General

Sistema de permisos granulares para controlar qué acciones puede realizar cada usuario en cada módulo del CRM.

---

## Roles Definidos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Admin** | Acceso total al sistema |Todos los permisos |
| **Manager** | Gestiona equipo ypipeline | Ver, crear, editar, eliminar en todo |
| **Vendedor** | Usuario operativo | Ver su info, crear/editar sus propios registros |
| **Solo lectura** | Consultor externo | Solo ver, sin editar |

---

## Permisos por Módulo

### Matriz de Permisos

| Módulo | Admin | Manager | Vendedor | Solo Lectura |
|--------|-------|---------|----------|--------------|
| **Dashboard** | ✓ | ✓ | ✓ | ✓ |
| **Pipeline** | CRUD | CRUD Propio | CRUD Propio | R |
| **Contactos** | CRUD | CRUD | R Propios | R |
| **Tareas** | CRUD | CRUD | CRUD Propio | R |
| **Correos** | CRUD | CRUD | R Propios | R |
| **Calendario** | CRUD | CRUD | CRUD Propio | R |
| **Reportes** | CRUD | R | R Propio | R |
| **Automatizaciones** | CRUD | CR | - | - |
| **Equipo** | CRUD | R | - | - |
| **Productos** | CRUD | CR | R | R |
| **Documentos** | CRUD | CRUD | CRUD Propio | R |
| **Configuración** | CRUD | R | - | - |

###Leyenda: C=Crear, R=Leer, U=Actualizar, D=Eliminar

---

## Permisos Específicos

### Pipeline
- Mover deals entre etapas: todos
- Editar valor/probabilidad: responsable o superior
- Eliminar deal: solo Admin/Manager
- Reasignar deal: Manager/Admin

### Contactos
- Ver todos los contactos: Admin/Manager
- Ver solo asignados: Vendedor
- Editar cualquier contacto: Admin/Manager
- Importar CSV: Admin/Manager
- Exportar: Admin/Manager

### Tareas
- Asignar a cualquier usuario: Admin/Manager
- Crear tareas para otros: Admin/Manager
- Completar tareas de otros: Admin/Manager

### Automatizaciones
- Crear/editar: Admin/Manager
- Activar/desactivar: Admin
- Ver logs: Admin/Manager

---

## Implementación Frontend

### UI de Permisos (Admin)

En módulo Equipo → Pestaña Permisos:
- Matriz interactiva: filas = módulos, columnas = acciones
- Toggle para activar/desactivar cada permiso por rol
- "Seleccionar todo" por fila o columna

### Protección de Rutas

```javascript
// Verificar permisos antes de renderizar
const canPerform = (userRole, module, action) => {
  const permissions = ROLE_MATRIX[userRole]?.[module];
  return PERMISSION_ACTIONS[action]?.(permissions);
}
```

### Componentes de Protección

- `<PermissionGuard>` - Wrapper que muestra/oculta según permisos
- Botones disabled si no tiene permiso
- Redirect a "Sin acceso" si intenta ruta prohibida

---

## Datos Mock

### Roles en Store

```javascript
const roles = [
  { id: 'admin', name: 'Admin', color: '#2563EB' },
  { id: 'manager', name: 'Manager', color: '#7C3AED' },
  { id: 'vendedor', name: 'Vendedor', color: '#16A34A' },
  { id: 'readonly', name: 'Solo lectura', color: '#6B7280' }
];
```

### Equipo con Roles

- Ana García → Admin
- Carlos López → Manager
- María Santos → Vendedor
- Pedro Ruiz → Vendedor
- Laura Chen → Vendedor
- Miguel Torres → Solo lectura

---

## Notas

- En esta versión (mock data), los permisos se simulan con Zustand
- El rol del usuario actual se guarda en `userStore.currentUser.role`
- La UI debe reflejar el rol mediante badges de color
- No hay backend real, pero la estructura está lista para escalar