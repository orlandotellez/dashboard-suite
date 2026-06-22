# Empty States - Estados Vacíos

## Visión General

Mensajes visuales cuando no hay datos en cada módulo.

---

## Estructura Base

```jsx
<div className="empty-state">
  <div className="empty-icon">
    <Icon icon={iconType} />
  </div>
  <h3>No hay {entity} todavía</h3>
  <p>{subtitle}</p>
  {cta && <Button variant="primary">{cta}</Button>}
</div>
```

---

## Estilos Base

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #EFF6FF;
  color: #2563EB;
  border-radius: 50%;
  margin-bottom: 24px;
}

.empty-icon svg {
  width: 32px;
  height: 32px;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: #6B7280;
  max-width: 320px;
  margin-bottom: 24px;
}
```

---

## Empty States por Módulo

### Pipeline

```
Icon: ti-columns
Title: "No hay oportunidades todavía"
Subtitle: "Crea tu primera oportunidad para comenzar a gestionar tu pipeline"
CTA: "Nueva oportunidad"
```

### Contactos

```
Icon: ti-users
Title: "No hay contactos todavía"
Subtitle: "Agrega tus primeros contactos o importa una lista desde CSV"
CTA: "Nuevo contacto"
```

### Tareas

```
Icon: ti-checkbox
Title: "No hay tareas todavía"
Subtitle: "Crea tareas para mantenerte organizado y dar seguimiento a tus actividades"
CTA: "Nueva tarea"
```

### Correos

```
Icon: ti-mail
Title: "No hay correos en esta carpeta"
Subtitle: "Los correos que recibas aparecerán aquí"
CTA: "Redactar nuevo correo"
```

### Calendario

```
Icon: ti-calendar
Title: "No hay eventos hoy"
Subtitle: "Crea un evento para planificar tu día"
CTA: "Nuevo evento"
```

### Reportes

```
Icon: ti-chart-bar
Title: "No hay datos suficientes"
Subtitle: "Comienza a cerrar deals para ver analíticas y reportes de tu equipo"
CTA: null
```

### Automatizaciones

```
Icon: ti-bolt
Title: "No hay automatizaciones todavía"
Subtitle: "Crea flujos de trabajo automáticos para ahorrar tiempo"
CTA: "Nueva automatización"
```

### Equipo

```
Icon: ti-users-group
Title: "No hay miembros en el equipo"
Subtitle: "Invita a tu primer miembro para comenzar a colaborar"
CTA: "Invitar miembro"
```

### Productos

```
Icon: ti-package
Title: "No hay productos todavía"
Subtitle: "Agrega los productos o servicios que ofreces a tus clientes"
CTA: "Nuevo producto"
```

### Documentos

```
Icon: ti-file-text
Title: "No hay documentos todavía"
Subtitle: "Crea propuestas, contratos o cotizaciones para tus clientes"
CTA: "Nuevo documento"
```

---

## Variaciones

### Con Ilustración

```jsx
// Algunos pueden usar SVG illustration en lugar de icono
<div className="empty-illustration">
  <SVG path="empty-contacts.svg" />
</div>
```

### Empty Search

```jsx
// Cuando la búsqueda no retorna resultados
<div className="empty-state search">
  <div className="empty-icon">
    <Icon icon="ti-search" />
  </div>
  <h3>No se encontraron resultados</h3>
  <p>Intenta con otros términos de búsqueda</p>
</div>
```

### Empty con Filters Activos

```jsx
// Cuando filtros no retornan datos
<div className="empty-state">
  <div className="empty-icon">
    <Icon icon="ti-filter" />
  </div>
  <h3>No hay resultados con estos filtros</h3>
  <p>Intenta ajustar los filtros o limpiarlos</p>
  <button onClick={clearFilters}>Limpiar filtros</button>
</div>
```

---

## UX Guidelines

1. **Siempre dar una acción**: Si es posible, mostrar CTA
2. **Ser helpful**: Explicar qué hacer a continuación
3. **Ilustraciones**: Usar cuando agrega valor (no solo icono)
4. **Contexto**: Adaptar según el estado (primera vez vs vacío por filtros)

---

## Notas

- Todos los módulos necesitan empty state
- Verificar que cada lista/grilla tenga fallback
- Los empty states también van en Zustand para testing