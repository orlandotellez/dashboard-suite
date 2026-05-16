# Responsive - Diseño Adaptativo

## Visión General

Sistema responsive para el CRM. Desktop-first con breakpoints para tablet y mobile.

---

## Breakpoints

```css
/* Breakpoints */
--breakpoint-mobile: 480px;
--breakpoint-tablet: 768px;
--breakpoint-laptop: 1024px;
--breakpoint-desktop: 1280px;
--breakpoint-wide: 1536px;
```

| Dispositivo | Ancho | Sidebar | Contenido |
|-------------|-------|---------|-----------|
| Desktop | ≥1280px | 240px full | 100% |
| Laptop | 1024-1279px | 240px full | 100% |
| Tablet | 768-1023px | icon-only (64px) | 100% |
| Mobile | <768px | hidden, hamburger | 100% |

---

## Sidebar Adaptativo

### Desktop/Laptop (>1024px)

```
┌─────────────────────┬────────────────────────────────────┐
│ Logo                │                                    │
│ ─────────────────── │                                    │
│ PRINCIPAL           │                                    │
│  📊 Dashboard       │                                    │
│  📋 Pipeline        │         MAIN CONTENT               │
│  👥 Contactos       │                                    │
│  ☑️ Tareas           │                                    │
│ ─────────────────── │                                    │
│ VENTAS              │                                    │
│ ...                 │                                    │
└─────────────────────┘
```

- Width: 240px
- Texto visible
- Iconos + texto

### Tablet (768-1024px)

```
┌────┬────────────────────────────────────┐
│ I  │                                    │
│ ── │                                    │
│ 📊 │         MAIN CONTENT               │
│ 📋 │                                    │
│ 👥 │                                    │
│ ☑️ │                                    │
│ ── │                                    │
│ ...│                                    │
└────┘
```

- Width: 64px (icon-only)
- Solo iconos
- Tooltip al hover

### Mobile (<768px)

```
┌────────────────────────────────────┐
│ ☰  │ Pipeline                      │
├────────────────────────────────────┤
│                                    │
│         MAIN CONTENT               │
│                                    │
│                                    │
│                                    │
│                                    │
├────────────────────────────────────┤
│ 🏠 │ 📋 │ 👥 │ ☑️ │ 📊 │
└────────────────────────────────────┘
```

- Sidebar como overlay/drawer
- Hamburger en top-left
- Bottom tab navigation

---

## Collapse Sidebar (Tablet)

```css
@media (max-width: 1024px) {
  .sidebar {
    width: 64px;
  }

  .sidebar .nav-label,
  .sidebar .group-label,
  .sidebar .workspace-name,
  .sidebar .user-info {
    display: none;
  }

  .sidebar .nav-item {
    justify-content: center;
    padding: 8px;
  }
}
```

---

## Mobile Navigation

### Bottom Tabs

```jsx
<nav className="bottom-nav">
  <NavLink to="/dashboard" icon="ti-layout-dashboard" label="Home" />
  <NavLink to="/pipeline" icon="ti-columns" label="Pipeline" />
  <NavLink to="/contactos" icon="ti-users" label="Contactos" />
  <NavLink to="/tareas" icon="ti-checkbox" label="Tareas" />
  <NavLink to="/menu" icon="ti-menu" label="Más" />
</nav>
```

```css
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #FFFFFF;
  border-top: 1px solid #E5E7EB;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
  }
}
```

### Mobile Sidebar Drawer

```jsx
<div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
  <div className="drawer-backdrop" onClick={close} />
  <div className="drawer-content">
    {/* Full sidebar content */}
  </div>
</div>
```

---

## Components Responsive

### Tables → Cards

```css
/* Desktop: Table */
.contactos-table { display: table; }

/* Mobile: Cards */
@media (max-width: 768px) {
  .contactos-table { display: none; }
  .contactos-cards { display: grid; }
}
```

### Kanban → List

```css
/* Desktop: Kanban */
.kanban-board { display: flex; }

/* Mobile: List view */
@media (max-width: 768px) {
  .kanban-board { display: none; }
  .kanban-list { display: block; }
}
```

### Hide/Show Elements

```css
/* Hide on mobile */
.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only { display: block; }
}
```

---

## Responsive Breakpoints in Components

### Pipeline

```jsx
const Pipeline = () => {
  const viewMode = window.innerWidth < 768 ? 'list' : 'kanban';

  return viewMode === 'kanban' ? <KanbanView /> : <ListView />;
};
```

### Top Bar

```jsx
// Desktop: Full search + actions
// Mobile: Just hamburger + title
```

---

## Touch Optimizations

### Button Sizes

```css
/* Minimum touch target */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### No Hover-Only Actions

```css
/* Always show important actions, not just on hover */
.action-button {
  opacity: 1; /* Not 0 on default */
}

.action-button:hover {
  /* Enhanced on hover, but visible always */
}
```

### Swipe Support (optional)

```css
/* Horizontal scroll for kanban on touch */
.kanban-columns {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

---

## Notas

- Mobile como máximo 20% del uso esperado
- Priorizar funcionalidad desktop
- Testing en Chrome DevTools device mode
- Animaciones disable en reduced-motion