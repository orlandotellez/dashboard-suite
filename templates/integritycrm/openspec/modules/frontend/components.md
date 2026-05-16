# Components - Componentes UI

## Visión General

Biblioteca de componentes React para el CRM. Todos construidos con CSS puro, sin frameworks externos.

---

## Sistema de Diseño

### Colores

```css
--bg-page: #F9FAFB;
--bg-sidebar: #FFFFFF;
--bg-content: #FFFFFF;
--bg-secondary: #F3F4F6;

--text-primary: #111827;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;

--border-default: #E5E7EB;
--border-strong: #D1D5DB;

--accent: #2563EB;
--accent-hover: #1D4ED8;
--accent-light: #EFF6FF;
--accent-border: #BFDBFE;

--success: #16A34A;
--success-bg: #F0FDF4;
--warning: #D97706;
--warning-bg: #FFFBEB;
--danger: #DC2626;
--danger-bg: #FEF2F2;
--purple: #7C3AED;
--purple-bg: #F5F3FF;
```

### Tipografía

- **UI/Body**: Inter (weights: 300, 400, 500, 600)
- **Números**: Inter con `font-variant-numeric: tabular-nums`

### Border Radius

- Cards/Inputs: 8px
- Badges/Pills: 6px
- Tags: 4px
- Modals/Panels: 12px
- Avatars: 50%

### Sombras

```css
--shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
--shadow-dropdown: 0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.05);
--shadow-modal: 0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.06);
```

---

## Componentes Base

### Buttons

- `<Button variant="primary|secondary|ghost|danger">`
- Sizes: sm, md, lg
- States: default, hover, active, disabled, loading

### Inputs

- `<Input>` - texto simple
- `<Select>` - dropdown
- `<Textarea>` - multilinea
- `<Checkbox>` - con estilo custom
- `<Radio>` - opciones únicas
- Todos con estados: default, focus, error, disabled

### Cards

- `<Card>` - contenedor base
- `<CardHeader>` - header con título
- `<CardBody>` - contenido

### Badges/Pills

- `<Badge>` - colored pill (por status)
- `<Tag>` - small label
- `<PriorityBadge>` - alta/media/baja

### Avatars

- `<Avatar>` - círculo con iniciales o imagen
- `<AvatarGroup>` - conjunto de avatars

---

## Componentes de Layout

### AppShell

- `<Sidebar>` - navegación lateral
- `<TopBar>` - header superior
- `<MainContent>` - área de contenido

### Sidebar

- Logo + Workspace name
- Navigation groups con labels
- Nav items con icons
- User profile en footer

### TopBar

- Breadcrumb
- Search bar
- Notifications bell
- "+" New button

---

## Componentes de Módulos

### Dashboard

- `<KPICard>` - métrica con trend
- `<AreaChartCard>` - gráfico de área
- `<BarChartCard>` - gráfico de barras
- `<ActivityFeed>` - feed de actividad
- `<TaskList>` - lista de tareas
- `<Leaderboard>` - tabla de vendedores

### Pipeline

- `<KanbanBoard>` - board principal
- `<KanbanColumn>` - cada etapa
- `<DealCard>` - carta de oportunidad
- `<DealDetailPanel>` - panel de detalle
- `<PipelineFilters>` - filtros

### Contactos

- `<ContactsTable>` - tabla principal
- `<ContactCard>` - vista de tarjeta
- `<ContactDetail>` - página de detalle
- `<ContactForm>` - formulario de edición

### Tareas

- `<TaskListGroup>` - grupo de tareas
- `<TaskRow>` - fila individual
- `<TaskKanbanBoard>` - board de tareas
- `<TaskForm>` - crear/editar

### Correos

- `<FolderPanel>` - carpetas
- `<EmailList>` - lista de emails
- `<EmailContent>` - contenido
- `<EmailCompose>` - compositor
- `<EmailThread>` - hilo de conversación

### Calendario

- `<CalendarMonth>` - vista mes
- `<CalendarWeek>` - vista semana
- `<CalendarDay>` - vista día
- `<CalendarAgenda>` - vista agenda
- `<EventCard>` - evento en calendario
- `<EventModal>` - crear/editar evento

### Reportes

- `<ReportKPIs>` - métricas
- `<SalesChart>` - gráfico de ventas
- `<FunnelChart>` - embudo
- `<SourcePieChart>` - fuentes
- `<PerformanceTable>` - tablas

### Automatizaciones

- `<AutomationCard>` - tarjeta
- `<AutomationBuilder>` - builder visual
- `<TriggerNode>` - nodo trigger
- `<ConditionNode>` - nodo condición
- `<ActionNode>` - nodo acción

### Equipo

- `<TeamGrid>` - grid de miembros
- `<MemberCard>` - tarjeta
- `<MemberPanel>` - panel lateral
- `<PermissionsMatrix>` - matriz

### Productos

- `<ProductsTable>` - tabla
- `<ProductForm>` - formulario

### Documentos

- `<DocumentsTable>` - tabla
- `<DocumentEditor>` - editor completo
- `<DocumentPreview>` - modo preview

---

## Componentes Globales

### Command Palette

- `<CommandPalette>` - ⌘K modal
- `<CommandInput>` - input de búsqueda
- `<CommandResults>` - resultados
- `<CommandItem>` - cada resultado

### Notifications

- `<NotificationsPanel>` - slide-in
- `<NotificationItem>` - cada notificación

### Toasts

- `<ToastContainer>` - contenedor
- `<Toast>` - toast individual
- Tipos: success, error, warning, info

### Modals

- `<Modal>` - modal base
- `<ConfirmDialog>` - confirmación
- `<EmptyState>` - estado vacío

---

## Iconos

Usar **Tabler Icons** (ti-*):

```
ti-layout-dashboard  ti-columns         ti-users
ti-checkbox         ti-trending-up     ti-package
ti-file-text        ti-mail            ti-calendar
ti-chart-bar        ti-bolt            ti-users-group
ti-settings         ti-search          ti-bell
ti-help-circle     ti-plus            ti-edit
ti-trash           ti-check           ti-flag
```

---

## Notas

- Todos los componentes en `/src/components/`
- Cada componente en su propia carpeta
- Styles en archivo `.css` junto al componente
- No usar librerías de UI externo