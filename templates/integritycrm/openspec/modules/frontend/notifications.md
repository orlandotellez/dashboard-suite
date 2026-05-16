# Notifications - Sistema de Notificaciones

## Visión General

Panel de notificaciones slide-in desde la derecha en la top bar.

---

## Estructura

```
TopBar → Bell Icon → Click → NotificationsPanel (slide-in)
```

---

## Tipos de Notificación

| Tipo | Icon | Color | Cuándo |
|------|------|-------|--------|
| deal_updated | ti-refresh | purple | Cambio en deal |
| task_assigned | ti-user | blue | Tarea asignada |
| task_due | ti-alert | amber | Tarea por vencer |
| deal_won | ti-trophy | green | Deal ganado |
| deal_lost | ti-x | red | Deal perdido |
| email_received | ti-mail | gray | Nuevo email |
| mention | ti-at | blue | Mencionado en nota |
| system | ti-info-circle | gray | Sistema |

---

## Datos Mock (10)

```javascript
const notifications = [
  {
    id: '1',
    type: 'task_assigned',
    title: 'Nueva tarea asignada',
    message: 'Ana García te asignó "Llamar a TechCorp"',
    time: '5 min',
    read: false,
    actionUrl: '/tareas/abc123',
  },
  {
    id: '2',
    type: 'deal_updated',
    title: 'Deal actualizado',
    message: 'Global Ventures movido a Negociación',
    time: '1 hora',
    read: false,
    actionUrl: '/pipeline/def456',
  },
  // ... 8 más
];
```

---

## Componente NotificationsPanel

```jsx
<aside className={`notifications-panel ${isOpen ? 'open' : ''}`}>
  <header>
    <h2>Notificaciones</h2>
    <button onClick={markAllRead}>Marcar todo como leído</button>
  </header>

  <div className="filters">
    <button className="active">Todas</button>
    <button>Sin leer</button>
    <button>Menciones</button>
    <button>Tareas</button>
    <button>Deals</button>
  </div>

  <div className="notification-list">
    {notifications.map(notif => (
      <NotificationItem
        key={notif.id}
        notification={notif}
        onClick={() => handleNotificationClick(notif)}
      />
    ))}
  </div>

  <footer>
    <a href="/notificaciones">Ver todas las notificaciones</a>
  </footer>
</aside>
```

---

## NotificationItem

```jsx
<div
  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
  onClick={onClick}
>
  <div className={`notification-icon ${type}`}>
    <Icon type={notification.type} />
  </div>
  <div className="notification-content">
    <div className="notification-title">{title}</div>
    <div className="notification-message">{message}</div>
    <div className="notification-time">{time}</div>
  </div>
  {actionUrl && (
    <button className="notification-action">
      Ver
    </button>
  )}
</div>
```

### Estilos

```css
.notification-item.unread {
  background: #FFFFFF;
  border-left: 2px solid #2563EB;
}

.notification-item.read {
  background: #F9FAFB;
}

.notification-item:hover {
  background: #F3F4F6;
}
```

---

## Badge en Bell Icon

```jsx
<span className="notification-badge">
  {unreadCount > 0 && unreadCount}
</span>
```

```css
.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #DC2626;
  color: white;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
```

---

## Slide Animation

```css
.notifications-panel {
  position: fixed;
  top: 56px; /* topbar height */
  right: 0;
  bottom: 0;
  width: 380px;
  background: #FFFFFF;
  border-left: 1px solid #E5E7EB;
  transform: translateX(100%);
  transition: transform 0.25s ease-out;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.notifications-panel.open {
  transform: translateX(0);
}
```

---

## Acciones

### Marcar como leído

```javascript
const markAsRead = (id) => {
  updateNotification(id, { read: true });
  decrementUnreadCount();
};

const markAllRead = () => {
  notifications.forEach(n => markAsRead(n.id));
};
```

### Eliminar notificación

```javascript
const deleteNotification = (id) => {
  removeNotification(id);
};
```

---

## Notas

- Max 50 notificaciones en memoria
- Persistir leídas en localStorage
- Auto-remove después de 30 días
- "Sin leer" primero en lista