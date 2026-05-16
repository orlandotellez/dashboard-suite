# Command Palette - ⌘K

## Visión General

Buscador global estilo Spotlight/Alfred para navegación rápida y acciones.

---

## Activación

```javascript
// Keyboard shortcut
useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }
    if (e.key === 'Escape') {
      closeCommandPalette();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## Estructura del UI

```jsx
<div className={`command-palette-overlay ${isOpen ? 'open' : ''}`}>
  <div className="command-palette">
    <div className="command-input-wrapper">
      <Icon icon="ti-search" className="search-icon" />
      <input
        type="text"
        placeholder="Buscar contactos, oportunidades, tareas..."
        value={query}
        onChange={handleSearch}
        autoFocus
      />
      <span className="shortcut-hint">ESC</span>
    </div>

    <div className="command-results">
      {groups.map(group => (
        <CommandGroup
          key={group.label}
          label={group.label}
          items={group.items}
        />
      ))}
    </div>
  </div>
</div>
```

---

## Estilos del Overlay

```css
.command-palette-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 120px;
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, visibility 0.15s ease;
}

.command-palette-overlay.open {
  opacity: 1;
  visibility: visible;
}
```

---

## Estilos del Palette

```css
.command-palette {
  width: 560px;
  max-height: 480px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1),
              0 8px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

---

## Input

```css
.command-input-wrapper {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #E5E7EB;
}

.command-input-wrapper input {
  flex: 1;
  border: none;
  font-size: 16px;
  color: #111827;
  background: transparent;
  outline: none;
}

.command-input-wrapper input::placeholder {
  color: #9CA3AF;
}

.search-icon {
  color: #9CA3AF;
  margin-right: 12px;
}

.shortcut-hint {
  font-size: 11px;
  color: #9CA3AF;
  background: #F3F4F6;
  padding: 4px 8px;
  border-radius: 4px;
}
```

---

## Grupos de Resultados

### Estructura de Datos

```javascript
const commandGroups = [
  {
    label: 'CONTACTOS',
    items: [
      { type: 'contact', id: '1', name: 'Roberto Díaz', subtitle: 'TechCorp - CTO', icon: 'ti-user' },
      { type: 'contact', id: '2', name: 'Carolina Mendoza', subtitle: 'Innova Digital', icon: 'ti-user' },
    ]
  },
  {
    label: 'OPORTUNIDADES',
    items: [
      { type: 'deal', id: '1', name: 'TechCorp - $85,000', subtitle: 'Prospecto', icon: 'ti-target' },
    ]
  },
  {
    label: 'TAREAS',
    items: [
      { type: 'task', id: '1', name: 'Llamar a TechCorp', subtitle: 'Hoy - Alta', icon: 'ti-checkbox' },
    ]
  },
  {
    label: 'ACCIONES RÁPIDAS',
    items: [
      { type: 'action', name: 'Nueva oportunidad', subtitle: 'Ctrl+N', icon: 'ti-plus' },
      { type: 'action', name: 'Nuevo contacto', subtitle: '', icon: 'ti-user-plus' },
      { type: 'action', name: 'Nueva tarea', subtitle: '', icon: 'ti-check' },
      { type: 'action', name: 'Ir a Pipeline', subtitle: 'P', icon: 'ti-columns' },
      { type: 'action', name: 'Ir a Calendario', subtitle: 'C', icon: 'ti-calendar' },
    ]
  },
];
```

---

## CommandItem

```jsx
<div
  className={`command-item ${selectedIndex === index ? 'selected' : ''}`}
  onClick={() => handleSelect(item)}
  onMouseEnter={() => setSelectedIndex(index)}
>
  <div className={`item-icon ${item.type}`}>
    <Icon icon={item.icon} />
  </div>
  <div className="item-content">
    <span className="item-name">{item.name}</span>
    {item.subtitle && (
      <span className="item-subtitle">{item.subtitle}</span>
    )}
  </div>
  {item.shortcut && (
    <span className="item-shortcut">{item.shortcut}</span>
  )}
</div>
```

```css
.command-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
}

.command-item.selected {
  background: #EFF6FF;
}

.item-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-right: 12px;
}

.item-icon.contact { background: #EFF6FF; color: #2563EB; }
.item-icon.deal { background: #F5F3FF; color: #7C3AED; }
.item-icon.task { background: #FEF3C7; color: #D97706; }
.item-icon.action { background: #F3F4F6; color: #6B7280; }

.item-name {
  font-size: 14px;
  color: #111827;
}

.item-subtitle {
  font-size: 12px;
  color: #6B7280;
}

.item-shortcut {
  font-size: 11px;
  color: #9CA3AF;
  margin-left: auto;
}
```

---

## Búsqueda

```javascript
const handleSearch = (e) => {
  const query = e.target.value.toLowerCase();

  // Filtrar items
  const filtered = allItems.filter(item =>
    item.name.toLowerCase().includes(query) ||
    item.subtitle?.toLowerCase().includes(query)
  );

  // Agrupar por tipo
  const grouped = groupByType(filtered);
  setResults(grouped);
};
```

```javascript
// Debounce 150ms
const debouncedSearch = useDebounce(query, 150);
```

---

## Navegación Keyboard

```javascript
const handleKeyDown = (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setSelectedIndex(prev => Math.min(prev + 1, totalItems - 1));
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    setSelectedIndex(prev => Math.max(prev - 1, 0));
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSelect(results[selectedIndex]);
  }
};
```

---

## Acciones al Seleccionar

```javascript
const handleSelect = (item) => {
  closePalette();

  switch (item.type) {
    case 'contact':
      navigate(`/contactos/${item.id}`);
      break;
    case 'deal':
      navigate(`/pipeline/${item.id}`);
      break;
    case 'task':
      navigate(`/tareas/${item.id}`);
      break;
    case 'action':
      executeAction(item.action);
      break;
  }
};
```

---

##Notas

- Soporte para keyboard navigation
- Máximo 20 resultados visibles
- Click fuera cierra el palette
- Persistir última búsqueda