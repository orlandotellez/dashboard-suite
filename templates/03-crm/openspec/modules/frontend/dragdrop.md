# Drag & Drop - Pipeline Kanban

## Visión General

Sistema de drag & drop para el pipeline usando eventos de mouse (sin librerías externas).

---

## Estructura del Board

```jsx
<div className="kanban-board">
  {stages.map(stage => (
    <KanbanColumn key={stage.id} stage={stage}>
      {deals
        .filter(d => d.stage === stage.id)
        .map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))}
    </KanbanColumn>
  ))}
</div>
```

---

## Estado de Drag

```javascript
const [dragState, setDragState] = useState({
  isDragging: false,
  draggedDeal: null,
  sourceStage: null,
  hoverStage: null,
});
```

---

## Handlers de Drag

### onMouseDown - Iniciar drag

```javascript
const handleDragStart = (e, deal) => {
  e.preventDefault();

  // Calcular offset del click
  const rect = e.currentTarget.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  setDragState({
    isDragging: true,
    draggedDeal: deal,
    sourceStage: deal.stage,
    hoverStage: null,
    offsetX,
    offsetY,
  });

  // Agregar clase para efectos visuales
  e.currentTarget.classList.add('dragging');
};
```

### onMouseMove - Mover card

```javascript
const handleDragMove = (e) => {
  if (!dragState.isDragging) return;

  // Detectar column hover
  const columns = document.querySelectorAll('.kanban-column');
  const card = e.currentTarget;

  columns.forEach(col => {
    const rect = col.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right) {
      const stageId = col.dataset.stage;
      if (stageId !== dragState.hoverStage) {
        setDragState(prev => ({ ...prev, hoverStage: stageId }));
      }
    }
  });
};
```

### onMouseUp - Soltar

```javascript
const handleDragEnd = (e) => {
  if (!dragState.isDragging) return;

  const { draggedDeal, sourceStage, hoverStage } = dragState;

  // Si cambió de etapa, actualizar
  if (hoverStage && hoverStage !== sourceStage) {
    updateDeal(draggedDeal.id, { stage: hoverStage });

    // Agregar al historial de actividades
    addActivity({
      type: 'stage_changed',
      description: `Deal movido de ${sourceStage} a ${hoverStage}`,
      relatedId: draggedDeal.id,
    });
  }

  // Reset state
  setDragState({
    isDragging: false,
    draggedDeal: null,
    sourceStage: null,
    hoverStage: null,
  });

  // Remover clases
  document.querySelectorAll('.dragging').forEach(el => {
    el.classList.remove('dragging');
  });
};
```

---

## Estilos durante Drag

### Card siendo arrastrada

```css
.deal-card.dragging {
  transform: rotate(3deg) scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  opacity: 0.9;
  cursor: grabbing;
  position: fixed;
  z-index: 1000;
  pointer-events: none;
}
```

### Column hover (drop target)

```css
.kanban-column.drag-over {
  background-color: #EFF6FF;
  border: 2px dashed #2563EB;
}
```

---

## Posicionamiento del Card

```javascript
// Durante drag, seguir al mouse
useEffect(() => {
  if (!dragState.isDragging) return;

  const handleMouseMove = (e) => {
    const card = document.querySelector('.deal-card.dragging');
    if (card) {
      card.style.left = `${e.clientX - dragState.offsetX}px`;
      card.style.top = `${e.clientY - dragState.offsetY}px`;
    }
  };

  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, [dragState.isDragging]);
```

---

## Drop Animation

```css
/* Animación suave al soltar */
.deal-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.deal-card.dropping {
  animation: dropBounce 0.3s ease;
}

@keyframes dropBounce {
  0% { transform: scale(1.02); }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
}
```

---

## Columnas con Drop

```jsx
<div
  className={`kanban-column ${dragState.hoverStage === stage.id ? 'drag-over' : ''}`}
  onMouseUp={() => {
    if (dragState.isDragging) {
      handleDrop(stage.id);
    }
  }}
>
  {/* cards */}
</div>
```

---

## Optimizaciones

### Virtualización (para +50 deals)

```javascript
// Solo renderizar deals visibles
const visibleDeals = deals
  .filter(d => d.stage === stage.id)
  .slice(0, 20); // primeros 20

// Cargar más al scroll
const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMoreDeals(stage.id);
  }
};
```

### Debounce de updates

```javascript
// No actualizar en cada pixel
const debouncedMove = useDebounce((dealId, stage) => {
  updateDeal(dealId, { stage });
}, 100);
```

---

## UX Details

### Indicador visual de drop

```jsx
{/* Placeholder vacío mientras arrastra */}
{dragState.isDragging && (
  <div className="drop-placeholder">
    Soltar aquí
  </div>
)}
```

### Prevenir defaults

```javascript
// En el board
const handleDragOver = (e) => {
  e.preventDefault(); // Necesario para permitir drop
};
```

---

## Notas

- Solo eventos de mouse (no touch) para MVP
- Sin react-beautiful-dnd (usa mouse events)
- Transición suave al soltar
- Feedback visual inmediato
- Persistir cambio en store