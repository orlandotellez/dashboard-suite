```
Build a complete CRM (Customer Relationship Management) web application as a React
single-page application called "IntegrityCRM". All state managed in memory using
React hooks and Zustand. No backend, no database. Light mode only.

---

## AESTHETIC DIRECTION

Professional, clean, and trustworthy. Think Linear meets Notion meets HubSpot —
but more refined. This is a tool people use 8 hours a day, so it must be
comfortable, dense without being cluttered, and fast-feeling.

NOT: corporate and boring. NOT: startup-flashy with gradients everywhere.
YES: precise, airy, confident. Every element earns its place.

Color system:
- Page background: #F9FAFB (cool off-white)
- Sidebar background: #FFFFFF
- Content surface: #FFFFFF
- Secondary surface: #F3F4F6
- Primary text: #111827
- Secondary text: #6B7280
- Tertiary text: #9CA3AF
- Border default: #E5E7EB
- Border strong: #D1D5DB
- Primary accent: #2563EB (electric blue — buttons, active states, links)
- Accent hover: #1D4ED8
- Accent light bg: #EFF6FF (blue tint for selected rows, active nav)
- Accent border: #BFDBFE
- Success: #16A34A / bg #F0FDF4
- Warning: #D97706 / bg #FFFBEB
- Danger: #DC2626 / bg #FEF2F2
- Purple (for tags/labels): #7C3AED / bg #F5F3FF
- Pipeline stage colors:
  Prospecto: #6B7280 (gray)
  Contactado: #2563EB (blue)
  Propuesta: #D97706 (amber)
  Negociación: #7C3AED (purple)
  Ganado: #16A34A (green)
  Perdido: #DC2626 (red)

Typography (Google Fonts — import both):
- UI / Body: "Inter" — weight 300, 400, 500, 600. Primary font for everything.
- Numbers / Data: "Inter" with tabular-nums font-variant for all stats,
  currency values, and counters (font-variant-numeric: tabular-nums).

Design rules:
- Border radius: 8px for cards and inputs, 6px for badges/pills, 4px for tags,
  12px for modals and panels, 50% for avatars.
- Shadows: use sparingly.
  Card shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
  Dropdown shadow: 0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.05)
  Modal shadow: 0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.06)
- No gradients on UI elements. Flat fills only.
- Dividers: 1px solid #E5E7EB.
- All inputs: border 1px solid #D1D5DB, focus border #2563EB + ring
  (box-shadow: 0 0 0 3px rgba(37,99,235,0.12)).
- Hover on table rows: background #F9FAFB.
- Active nav item: background #EFF6FF, color #2563EB, left border 2px solid #2563EB.

---

## APP SHELL

Fixed left sidebar (240px wide) + top bar (56px) + main content area.
Content area scrolls independently. Sidebar and top bar are always visible.

### SIDEBAR

Top section:
- Logo area (height 56px, border-bottom 1px solid #E5E7EB):
  Blue square icon (rounded 8px, #2563EB bg) with white "I" lettermark.
  Beside it: "IntegrityCRM" in Inter 600, 15px, #111827.
  Below name: "Agencia Pro" in Inter 400, 11px, #6B7280 (workspace name).

Navigation groups (with group labels):

PRINCIPAL:
- Dashboard (ti-layout-dashboard)
- Pipeline (ti-columns) ← default active
- Contactos (ti-users)
- Tareas (ti-checkbox)

VENTAS:
- Oportunidades (ti-trending-up)
- Productos (ti-package)
- Documentos (ti-file-text)

COMUNICACIÓN:
- Correos (ti-mail) — with unread badge (red dot, number)
- Calendario (ti-calendar)

ANÁLISIS:
- Reportes (ti-chart-bar)
- Automatizaciones (ti-bolt)

CONFIGURACIÓN:
- Equipo (ti-users-group)
- Configuración (ti-settings)

Group labels: Inter 500, 10px, #9CA3AF, letter-spacing 0.08em, uppercase.
Nav items: Inter 400, 14px, #6B7280. Icon 16px. Padding 8px 12px. Border-radius 6px.
Active: background #EFF6FF, color #2563EB, font-weight 500.
Hover: background #F3F4F6.
Left border on active: 2px solid #2563EB (on the left edge of the item).

Bottom of sidebar:
- User profile block (border-top 1px solid #E5E7EB, padding 12px):
  Avatar (32px circle, initials with blue bg).
  Name: Inter 500, 13px, #111827.
  Role: Inter 400, 11px, #6B7280.
  Three-dot menu icon on hover.

### TOP BAR

Height 56px. Background #FFFFFF. Border-bottom 1px solid #E5E7EB.
Flex, space-between, align-center. Padding 0 24px.

Left: breadcrumb — current module name in Inter 600, 15px, #111827.
  Some pages show: "Pipeline / Oportunidad: Empresa ABC" with separator " / " in gray.

Center: global search bar (width 320px).
  Background #F3F4F6. Border 1px solid transparent. Border-radius 8px.
  Placeholder: "Buscar contactos, oportunidades..." Inter 400, 13px, #9CA3AF.
  Left icon: ti-search, 15px, #9CA3AF.
  Right: "⌘K" shortcut pill in Inter 400, 11px, #9CA3AF.
  Focus: background white, border #2563EB, ring.

Right: row of actions (gap 8px):
  - Notifications bell (ti-bell) with red dot badge showing count.
    Click: dropdown panel showing 5 recent notifications with timestamps.
  - Help icon (ti-help-circle).
  - "+" New button: background #2563EB, color white, Inter 600, 13px,
    padding 7px 14px, border-radius 8px.
    Click: dropdown menu with quick-create options:
    Nuevo contacto / Nueva oportunidad / Nueva tarea / Nuevo correo

---

## MODULE 1 — DASHBOARD

URL/state: /dashboard

Three rows of content inside a max-width container with 24px padding.

### ROW 1 — KPI Cards (6 cards, CSS grid 3+3 or 6 equal cols)

Each KPI card: white bg, border 1px solid #E5E7EB, border-radius 8px, padding 20px.
Card layout:
- Top row: label (Inter 500, 12px, #6B7280, uppercase, letter-spacing 0.05em) + 
  icon right-aligned (16px, colored per metric).
- Main number: Inter 600, 32px, #111827, tabular-nums, margin-top 8px.
- Bottom row: trend badge + comparison text.
  Trend badge: small pill, green bg + green text for positive ("↑ 12%"),
  red for negative ("↓ 3%"). Inter 500, 11px.
  Comparison: "vs mes anterior" Inter 400, 12px, #9CA3AF.

KPIs:
- Total clientes activos (icon: ti-users, blue)
- Oportunidades abiertas (icon: ti-target, purple)
- Valor del pipeline (icon: ti-currency-dollar, green) — format $1,240,500
- Tasa de conversión (icon: ti-percent, amber) — format 24.3%
- Tareas pendientes hoy (icon: ti-checkbox, blue)
- Correos sin responder (icon: ti-mail, red)

### ROW 2 — Charts (2 columns: 8/4 split)

LEFT (8 cols) — "Rendimiento de ventas":
Card with header (title left, period selector right: "7D / 30D / 90D" pills).
Area chart (use recharts AreaChart):
  Two overlapping area series: "Oportunidades ganadas" (blue, opacity 0.15 fill)
  vs "Objetivo mensual" (gray dashed line).
  X-axis: months. Y-axis: currency values.
  Smooth curves, no dots on line, tooltip on hover.
  Legend below chart: two color dots + labels.

RIGHT (4 cols) — "Pipeline por etapa":
Card with title.
Horizontal bar chart (recharts):
Each pipeline stage as a row:
  Stage name (Inter 400, 13px) | bar (colored per stage) | value + count.
Bars are thin (height 8px), rounded, with muted bg track.
Order: Prospecto → Contactado → Propuesta → Negociación → Ganado.
Count badges on right: "12 deals · $340K".

### ROW 3 — Three panels (4/4/4 split)

LEFT — "Actividad reciente":
Card. Vertical feed of 8 recent events.
Each event: small colored icon (circle 28px) + text + time.
Event types:
  - Nuevo contacto agregado (blue circle, ti-user-plus)
  - Oportunidad actualizada (purple, ti-refresh)
  - Tarea completada (green, ti-check)
  - Correo enviado (gray, ti-mail)
  - Deal ganado (green filled, ti-trophy)
Text: Inter 400, 13px, #374151. "Ana García agregó contacto Empresa XYZ"
Time: Inter 400, 11px, #9CA3AF, right-aligned. "hace 5 min"
Divider between items: 1px solid #F3F4F6.

CENTER — "Tareas de hoy":
Card with header + "Ver todas →" link.
List of 6 tasks:
Each: checkbox (custom styled, blue check when done) + task text + 
assignee avatar (20px) + priority badge + due time.
Priority badges: Alta (red pill), Media (amber), Baja (gray).
Completed task: text strikethrough, muted color.
"+ Nueva tarea" button at bottom: dashed border, full width, Inter 400, 13px, #6B7280.

RIGHT — "Mejores vendedores":
Card with title + period selector.
Leaderboard of 5 team members:
Each row: rank number + avatar (32px) + name + deals count + revenue + 
progress bar (thin, blue, shows % of target).
1st place: gold number. 2nd: silver. 3rd: bronze.
Inter 500, 13px for names. Tabular-nums for numbers.

---

## MODULE 2 — PIPELINE (KANBAN)

URL/state: /pipeline

This is the hero module. Full height, horizontal scroll kanban board.

### TOP BAR (below main top bar):
Background #FFFFFF. Border-bottom 1px solid #E5E7EB. Padding 12px 24px. Flex.

Left: "Pipeline de ventas" title (Inter 600, 15px).
Center: filter bar:
  - Search input (compact, 200px): "Buscar oportunidades..."
  - "Responsable" dropdown filter
  - "Etapa" dropdown filter
  - "Valor" range filter
  - "Periodo" date range picker
  - Clear filters link (only shows when filters active)
Right:
  - View toggle: Kanban ⊞ | Lista ☰ | Tabla ▦
  - "Nueva oportunidad" button (primary blue)

### KANBAN BOARD

Full-height scrollable area. Horizontal scroll when columns overflow.
Background: #F3F4F6.

6 columns (fixed width 280px each, gap 16px, padding 16px):
PROSPECTO · CONTACTADO · PROPUESTA · NEGOCIACIÓN · GANADO · PERDIDO

Each column:

COLUMN HEADER:
Flex, space-between. Padding-bottom 12px.
Left: colored dot (6px, stage color) + stage name (Inter 600, 13px, #111827).
Center: count badge (Inter 500, 11px, colored pill matching stage).
Right: total value (Inter 600, 12px, #6B7280, tabular-nums) + "+" icon button.

DEAL CARDS (draggable — implement drag with onMouseDown or react-beautiful-dnd):
White bg. Border 1px solid #E5E7EB. Border-radius 8px. Padding 14px.
Card shadow on drag: 0 8px 16px rgba(0,0,0,0.12).
Margin-bottom 8px.

Card layout:
- TOP ROW: company name (Inter 600, 13px, #111827) + priority flag icon.
  Priority: red ti-flag-filled for Alta, orange for Media, nothing for Baja.
- SECOND ROW: contact name (Inter 400, 12px, #6B7280) + avatar (20px circle).
- MIDDLE: deal value (Inter 700, 18px, #111827, tabular-nums). Format: $120,000.
- PROGRESS: thin horizontal bar showing deal probability %.
  Label left: "Probabilidad" (Inter 400, 11px, #9CA3AF).
  Value right: "75%" (Inter 600, 11px, #2563EB).
- BOTTOM ROW: 
  Left: due date chip (ti-calendar icon + date, Inter 400, 11px).
    Overdue: red text + red bg chip.
  Right: assignee avatar (24px) + tag chips (1-2 colored pills, 10px text).

Hover on card: border-color #BFDBFE, slight shadow increase.
On drag: card gets 8deg rotation + shadow + opacity 0.9.

COLUMN FOOTER:
"+ Agregar oportunidad" — dashed border button, full column width.
Inter 400, 13px, #9CA3AF. Hover: #2563EB text + blue dashed border.

COLUMN TOTALS (sticky at column bottom):
"Total: $1,240,000 · 14 deals" Inter 500, 11px, #6B7280.

### LIST VIEW (alternate view):

Full-width table. White bg card.
Columns: ☐ | Empresa | Contacto | Etapa | Valor | Probabilidad | 
Responsable | Cierre estimado | Actividad | Acciones

Sortable column headers (click to sort, direction arrow appears).
Etapa: colored pill badge per stage.
Probabilidad: mini bar inline.
Responsable: avatar + name.
Actividad: "hace 2 días" with colored dot (green = recent, yellow = aging, red = stale).
Acciones: Edit / Delete icons on row hover.

Pagination: 25/50/100 rows. Total count. Previous/Next buttons.

### DEAL DETAIL PANEL

Click any deal card → slide-in panel from RIGHT (width 520px, full height).
Backdrop: subtle dark overlay on kanban.

Panel header:
Company name (Inter 700, 20px) + stage badge + close button (×).
Below: deal value (Inter 700, 28px, blue, tabular-nums) + probability chip.

Tabs inside panel: RESUMEN · ACTIVIDAD · CONTACTO · ARCHIVOS

RESUMEN tab:
Two-column layout:
Left: editable fields:
  - Empresa, Contacto principal, Responsable (dropdown)
  - Etapa (dropdown with stage colors)
  - Probabilidad (slider 0–100%)
  - Valor del deal (number input)
  - Fecha de cierre estimada
  - Fuente del lead (dropdown)
  - Tags (chip input)
  - Notas (textarea)
Right: deal metadata:
  - Creado por + date
  - Última actividad
  - Días en etapa actual
  - Historial de etapas (mini timeline)

ACTIVIDAD tab:
Timeline of all activities (calls, emails, meetings, notes, stage changes).
Each entry: icon + description + user + timestamp.
At top: "Registrar actividad" button → inline form to add note/call/meeting.

CONTACTO tab:
Contact card: avatar, name, role, company, email (clickable), phone, LinkedIn.
Recent email thread preview.

ARCHIVOS tab:
File list with type icons, name, size, upload date, download button.
Upload dropzone at top.

---

## MODULE 3 — CONTACTOS

URL/state: /contactos

### HEADER:
Title "Contactos" + total count badge.
Right: search, filters (Empresa / Etiqueta / Responsable / País), 
"Importar CSV" button (secondary), "Nuevo contacto" (primary blue).

View toggle: Tabla | Tarjetas

### TABLE VIEW:

Columns: ☐ | Avatar+Nombre | Empresa | Cargo | Email | Teléfono | 
Etiquetas | Últ. actividad | Responsable | Acciones

Name cell: avatar (32px, initials + colored bg) + full name (Inter 500, 13px) +
below name: email (Inter 400, 12px, #6B7280).
Company: company name + small company logo placeholder.
Tags: 1-2 colored chip pills (overflow: "+3 más").
Last activity: relative time + activity type icon.
Assignee: avatar + tooltip with name.
Actions (on hover): Edit (ti-edit) · Email (ti-mail) · Delete (ti-trash).

Bulk actions bar (appears when rows selected):
Fixed at bottom. Blue bg. Shows: "X seleccionados" +
buttons: Asignar responsable / Agregar etiqueta / Exportar / Eliminar.

### CARD VIEW:

Grid 4 columns. Each contact card:
Top: company logo/avatar area (full width, colored bg strip).
Center: contact avatar (48px) overlapping the strip.
Below: name (Inter 600, 14px) + role (Inter 400, 12px, #6B7280) + company.
Tag row: 1-3 pill tags.
Bottom row: email icon button + phone icon button + deal count badge.
Hover: border-color #BFDBFE, shadow increase.

### CONTACT DETAIL PAGE:

Full page (not panel). Two-column layout (3/9 split).

LEFT SIDEBAR:
Contact card: large avatar (64px) + name (Inter 700, 20px) + role + company.
Action buttons: "Enviar correo" · "Nueva tarea" · "Registrar llamada" (blue pills row).
Info list (label + editable value, click pencil to edit):
  Email · Teléfono · Empresa · Cargo · LinkedIn · País · Ciudad
  Fuente · Responsable · Etiquetas
Score bar: "Lead score: 78/100" with colored bar.
Deal count: "3 oportunidades activas" with blue link.

RIGHT MAIN AREA: same tab structure as deal panel (Actividad / Oportunidades / 
Correos / Tareas / Archivos / Notas).

---

## MODULE 4 — TAREAS

URL/state: /tareas

### HEADER:
"Tareas" title + count badges: Hoy (blue) · Próximas (gray) · Vencidas (red).
Right: filter (Responsable / Tipo / Prioridad), "Nueva tarea" button.

View toggle: Lista | Tablero Kanban | Calendario

### LIST VIEW:

Grouped by: HOY / MAÑANA / ESTA SEMANA / MÁS ADELANTE / VENCIDAS

Group header: Inter 600, 13px, #111827 + count badge + "Agregar tarea" link.

Each task row:
- Custom checkbox (circle border, blue check on complete with strikethrough animation)
- Task title (Inter 400, 14px — strikethrough if done)
- Related to: small chip with linked contact/deal name + icon
- Due date: Inter 400, 12px, #6B7280 (red if overdue)
- Priority badge: Alta (red) / Media (amber) / Baja (gray) — small pill
- Type icon: Llamada (ti-phone) / Reunión (ti-users) / Email (ti-mail) / Tarea (ti-checkbox)
- Assignee: avatar (24px)
- Actions on hover: Edit · Reassign · Delete

Clicking task title: opens right-side panel with full task detail:
  Title (editable), description (rich textarea), type, priority, due date/time,
  assignee, related contact/deal, subtasks (checklist), attachments, comments.

### KANBAN VIEW for tasks:
4 columns: Pendiente / En progreso / En revisión / Completada
Same card style as pipeline but simpler (no value/probability).

---

## MODULE 5 — CORREOS (Email)

URL/state: /correos

Three-panel layout: folders (200px) | email list (340px) | email content (rest).

FOLDER PANEL (left):
Folders: Entrada · Enviados · Borradores · Archivados · Spam.
Each with unread count badge.
Below: "Etiquetas" section — colored dots + label names (Clientes / Leads / 
Interno / Urgente). "+ Nueva etiqueta" link.
Bottom: "Redactar" button (blue, full width, ti-pencil icon).

EMAIL LIST (center):
Search bar at top (full width).
Sort: Recientes / Sin leer / Con archivos.
Each email row:
  - Avatar (36px, sender initials)
  - Sender name (Inter 600, 13px — bold if unread)
  - Subject line (Inter 400, 13px, truncated)
  - Preview snippet (Inter 400, 12px, #9CA3AF, 1 line truncated)
  - Timestamp (Inter 400, 11px, #9CA3AF)
  - Attachment icon (ti-paperclip) if has files
  - Star icon (toggle favorite)
Unread emails: white bg + bold text + blue left border (2px).
Read emails: #F9FAFB bg.
Selected: #EFF6FF bg + blue left border.

EMAIL CONTENT (right):
Toolbar: Reply · Reply all · Forward · Archive · Delete · Mark unread · More.
Email header:
  Subject (Inter 700, 18px, #111827).
  From: avatar + name + email (Inter 400, 13px).
  To / CC (expandable).
  Date + "Hace 2 horas".
  Attachment strip if has files.
Email body: rendered HTML or plain text. Inter 400, 15px, line-height 1.7.
Thread: previous emails collapsed below with "Ver mensaje anterior" toggle.

COMPOSE MODAL (full modal):
To / CC / BCC fields (chip input for multiple recipients).
Subject line.
Rich text editor toolbar: B / I / U / Link / List / Quote / Attach.
Body textarea.
Bottom: Signature selector + "Enviar" (blue) + "Guardar borrador" + Discard.

---

## MODULE 6 — CALENDARIO

URL/state: /calendario

### HEADER:
Navigation: "< Enero 2025 >" with today button.
View toggle: Mes | Semana | Día | Agenda (pill buttons, active: blue).
Right: "Nuevo evento" (primary blue).

### MONTH VIEW:
Full-width calendar grid. 7 columns (days) × 5-6 rows.
Day headers: "LUN / MAR / MIÉ / JUE / VIE / SÁB / DOM" Inter 500, 12px, #6B7280.
Today: date number in blue circle.
Events inside cells:
  Colored pill (full width of cell, truncated). Colors by event type:
  Reunión (blue) · Llamada (purple) · Tarea (amber) · Demo (green) · Personal (gray).
  Inter 500, 11px, white text on colored bg. Border-radius 4px.
  "+3 más" link if overflow. Click → popover showing all events for that day.
Empty cells: hover shows "+" icon to create event.

### WEEK VIEW:
Time grid (7 columns × 24 hours). Events as positioned blocks.
Time labels (00:00 to 23:00) on left, 1px horizontal dividers per hour.
Current time: red horizontal line with dot.
Events: colored blocks with title, time, and avatar. Overlap = side by side.
Drag to move event (visual feedback only).

### AGENDA VIEW:
List grouped by date. Each date header (Inter 600, 14px, #111827).
Events under each date: time + colored dot + title + location/link.

### EVENT DETAIL MODAL:
Title, type, date/time, duration, attendees (avatars), 
description, linked contact/deal, location or meeting link.
Edit and Delete buttons.

---

## MODULE 7 — REPORTES

URL/state: /reportes

### HEADER:
"Reportes y Analíticas" title.
Right: date range picker (preset options: Esta semana / Este mes / 
Este trimestre / Este año / Personalizado) + Export PDF button.

### ROW 1 — Summary KPIs (same card style as dashboard, 4 cards):
Deals ganados este período · Valor total ganado · Tasa conversión · 
Tiempo promedio de cierre (días).

### ROW 2 — Main charts (8/4 split):

LEFT — "Ventas en el tiempo" (recharts LineChart or AreaChart):
Toggleable: Diario / Semanal / Mensual.
Multiple series: Deals cerrados (blue line) · Objetivo (gray dashed).
Tooltip shows date + value + vs previous period %.

RIGHT — "Fuentes de leads" (recharts PieChart or DonutChart):
Colored slices per source: Referido / Web / Email / Redes sociales / 
Llamada en frío / Evento.
Legend below with color + name + count + % of total.

### ROW 3 — Three charts (4/4/4):

"Rendimiento por etapa" — Funnel chart (custom divs with width % bars):
Each stage: name + count + conversion rate to next stage (arrow between stages).
Shows where deals drop off.

"Razones de pérdida" — Horizontal bar chart:
Precio muy alto / Eligió competidor / No era el momento / Sin respuesta / Otro.
Sorted by frequency. Red accent color.

"Actividad del equipo" — Stacked bar chart:
X-axis: team members. Bars: Llamadas / Emails / Reuniones / Tareas.
Each bar segment a different color. Legend at top.

### ROW 4 — Tables:

"Top deals del período" — sortable table:
Deal name · Company · Stage · Value · Close date · Assignee · Status.

"Rendimiento por vendedor" — leaderboard table:
Rank · Vendedor · Deals abiertos · Deals ganados · Valor · 
Tasa conversión · Actividades. Sortable. Avatar in name column.

---

## MODULE 8 — AUTOMATIZACIONES

URL/state: /automatizaciones

### HEADER:
Title + subtitle "Configura flujos de trabajo automáticos".
Right: "Nueva automatización" (primary blue).

### AUTOMATIONS LIST:

Grid of automation cards (2 columns):
Each card: white bg, border, border-radius 8px, padding 20px.

Card layout:
- Top row: automation icon (colored bg square, 36px) + name (Inter 600, 14px) +
  Active/Inactive toggle (right-aligned).
- Trigger line: "Cuando:" Inter 400, 13px, #6B7280 + trigger description.
- Action line: "Entonces:" same style + action description.
- Stats row: "Ejecutada 124 veces · Última: hace 2h" Inter 400, 11px, #9CA3AF.
- Bottom: Edit button + Run log link.

Active toggle: iOS-style, blue when on, gray when off.

Sample automations:
1. "Bienvenida a nuevos leads" — trigger: nuevo contacto creado → enviar email de bienvenida
2. "Seguimiento post-reunión" — trigger: reunión marcada como completada → crear tarea de seguimiento
3. "Alerta de deal estancado" — trigger: deal sin actividad >7 días → notificar responsable
4. "Asignación automática" — trigger: nuevo lead de web → asignar al vendedor con menos deals
5. "Recordatorio de propuesta" — trigger: propuesta enviada hace 3 días sin respuesta → enviar follow-up
6. "Deal ganado onboarding" — trigger: deal marcado como ganado → crear checklist de onboarding

### AUTOMATION BUILDER MODAL (when creating new or editing):

Full-page modal or dedicated view.
Visual flow builder — vertical node graph:

TRIGGER node (blue):
  Select trigger type from dropdown:
  Nuevo contacto / Cambio de etapa / Email recibido / Tarea completada /
  Fecha específica / Deal ganado / Sin actividad por X días.
  Configure trigger parameters below the selector.

↓ arrow connector

CONDITION node (amber, optional, can be added):
  "Solo si..." conditional logic.
  Field selector + operator (es / no es / contiene / mayor que) + value.
  "Agregar condición" link for AND/OR logic.

↓ arrow connector

ACTION node(s) (purple, can add multiple):
  Action types: Enviar email / Crear tarea / Actualizar campo / 
  Notificar usuario / Cambiar etapa / Agregar etiqueta / Esperar X días.
  Each action fully configurable.

"+ Agregar acción" button below last action node.

Footer: Save + Activate / Save as draft / Cancel.

---

## MODULE 9 — EQUIPO

URL/state: /equipo

### HEADER:
"Equipo" title + member count.
Right: "Invitar miembro" button (primary blue).

### TEAM GRID:

3-column grid of team member cards.
Each card: white bg, border, border-radius 8px, padding 20px.

Card layout:
- Avatar (56px circle, colored bg with initials or photo).
- Name (Inter 600, 15px, #111827).
- Role badge: "Admin" (blue) / "Vendedor" (green) / "Manager" (purple) / 
  "Solo lectura" (gray). Colored pill.
- Email (Inter 400, 13px, #6B7280).
- Stats row: "12 deals · 34 tareas · 98% actividad" Inter 400, 12px, #9CA3AF.
- Status dot: green=activo, gray=inactivo, amber=invitación pendiente.
- Bottom: "Editar" link + "Ver perfil" link.

### MEMBER DETAIL PANEL (slide-in right, 480px):

Avatar (64px) + name + role badge.
Tabs: PERFIL · RENDIMIENTO · PERMISOS · ACTIVIDAD

PERFIL tab: editable info — name, email, phone, role, assigned pipeline, 
team, start date, two-factor auth toggle.

RENDIMIENTO tab:
Mini KPI cards: Deals ganados / Valor total / Tasa conversión / 
Actividades esta semana.
Line chart: rendimiento últimos 3 meses.
Deal list: their open deals as a compact table.

PERMISOS tab:
Permission matrix — rows are modules, columns are: Ver / Crear / Editar / Eliminar.
Checkboxes per intersection. Toggle all row button.

### PENDING INVITATIONS:

Section below team grid.
Table: Email · Role · Invited by · Date · Status ("Pendiente" badge) · 
Resend / Cancel actions.

---

## MODULE 10 — PRODUCTOS

URL/state: /productos

### HEADER:
"Catálogo de Productos y Servicios" title.
Right: search + filter (Categoría / Estado) + "Nuevo producto" button.

### PRODUCTS TABLE:

Columns: ☐ | Producto | SKU | Categoría | Precio | Tipo | Estado | Acciones

Producto cell: colored icon (category-based) + name (Inter 500, 13px) +
below: brief description (Inter 400, 12px, #9CA3AF, truncated).
Precio: Inter 600, 14px, tabular-nums, formatted as $X,XXX.
Tipo badge: "Producto" (blue) / "Servicio" (purple) / "Suscripción" (green).
Estado: "Activo" (green dot + text) / "Inactivo" (gray).
Actions: Edit / Deactivate / Delete (on hover).

### PRODUCT FORM DRAWER (right side, 440px):

INFORMACIÓN:
Name, SKU (auto-generated), description (textarea), category (dropdown),
type (radio: Producto / Servicio / Suscripción).

PRECIOS:
Price, currency (USD/MXN/EUR), tax included toggle, discount % field.
For subscriptions: billing period (Mensual / Anual / Trimestral).

METADATA:
Internal notes, tags, active status toggle.

---

## MODULE 11 — DOCUMENTOS

URL/state: /documentos

### HEADER:
"Documentos y Propuestas" title.
Right: filter + "Nuevo documento" button (dropdown: Propuesta / Contrato / 
Cotización / Otro).

### DOCUMENTS TABLE:

Columns: ☐ | Nombre | Tipo | Cliente | Estado | Valor | Creado | Acciones

Type badge: Propuesta (blue) / Contrato (purple) / Cotización (amber) / Otro (gray).
Status badges: Borrador (gray) / Enviado (blue) / Visto (amber, with eye icon) / 
Firmado (green) / Rechazado (red).
"Visto": shows timestamp of when client opened it.
Value: tabular-nums, formatted currency.
Actions: View / Edit / Send / Duplicate / Download / Delete.

### DOCUMENT EDITOR (full-page view):

Toolbar (top): back arrow + document name (editable inline) + status badge.
Right of toolbar: Share button + Download PDF + Send to client button.

Editor area (centered, max-width 860px, white paper bg, subtle shadow):
Document header template:
  Logo placeholder + company name.
  "PROPUESTA COMERCIAL" or document type.
  Document number + date.
  Client info block.

Content sections (editable):
  Rich text editor blocks. Add section button between blocks.
  Section types: Text / Products table / Signature / Terms / Custom.

Products/services table section:
  Inline editable table: description + qty + unit price + discount + total.
  Totals row: subtotal + tax + grand total.
  All currency fields tabular-nums.

Signature section: two boxes (client + company representative).

Preview mode toggle: shows clean rendered document as it would appear to client.

---

## GLOBAL COMPONENTS

### NOTIFICATIONS PANEL (slide-in from right, 380px):
Triggered by bell icon in top bar.
Header: "Notificaciones" + "Marcar todo como leído" link.
Filter pills: Todas / Sin leer / Mencionado / Tarea / Deal.
Feed of notifications:
  Icon (colored circle) + text + time + action button (if applicable).
  Unread: white bg + blue left border. Read: #F9FAFB.
Footer: "Ver todas las notificaciones" link.

### COMMAND PALETTE (⌘K):
Full-screen overlay with centered search.
Dark background (rgba(0,0,0,0.5)), backdrop-filter blur.
White box: border-radius 12px, shadow, width 560px.
Search input (large, Inter 400, 16px, no border, full width, autofocus).
Results grouped: CONTACTOS / OPORTUNIDADES / TAREAS / ACCIONES RÁPIDAS.
Each result: icon + name + metadata + keyboard shortcut hint.
Keyboard navigation (↑↓ arrows + Enter).
Close on Escape or outside click.

### EMPTY STATES (for all modules when no data):
Centered in content area.
Illustrated icon (simple SVG, colored blue/gray).
"No hay X todavía" headline (Inter 600, 16px, #111827).
Helpful subtitle (Inter 400, 14px, #6B7280).
Primary CTA button.

### CONFIRMATION DIALOGS:
Centered modal, max-width 400px.
Title (Inter 600, 16px) + description (Inter 400, 14px, #6B7280).
"Cancelar" (secondary) + "Eliminar" (red filled) buttons.
Red border-top on destructive dialogs (4px).

### TOAST NOTIFICATIONS:
Top-right, stacked. Width 320px. Border-radius 8px. Shadow.
Types: Success (green left border) / Error (red) / Warning (amber) / Info (blue).
Icon + message + optional action link + dismiss × .
Auto-dismiss after 4 seconds. Progress bar at bottom of toast.

---

## MOCK DATA

Contacts: 45 contacts with names, companies, emails, phones, tags, assignees,
  lead scores, last activity dates.
Deals: 28 deals distributed across all pipeline stages. Various values ($5K–$500K).
  Each linked to a contact and assignee.
Tasks: 35 tasks across all categories and priorities. Various due dates.
Emails: 20 sample emails in inbox with realistic subjects and previews.
Team: 8 team members with different roles and performance stats.
Products: 15 products/services with prices and categories.
Documents: 10 documents in various states.
Automations: 6 automations (as described above), mix of active/inactive.
Activity feed: 50 realistic activity entries across all record types.
Charts: realistic mock data for all charts covering last 6 months.

---

## TECHNICAL REQUIREMENTS

Stack: React + Zustand (state) + recharts (charts) + React Router or
hash-based routing for module navigation.

All data in Zustand stores:
  contactsStore / dealsStore / tasksStore / emailsStore /
  teamStore / productsStore / docsStore / automationsStore / activityStore.

Drag and drop in pipeline: implement with mouse events (onMouseDown/Move/Up)
or react-beautiful-dnd if available. Visual feedback required.

Responsive: desktop-first (sidebar collapses to icon-only at 1280px,
full mobile hamburger below 768px with bottom tab navigation).

Performance: virtualize long lists (>50 items) with windowing.
Debounce all search inputs (300ms).

Animations:
- Sidebar active state: 150ms ease transition.
- Panel slide-ins: 250ms ease-out translateX.
- Toasts: 200ms ease-out slide in from right.
- Card hover: 150ms ease box-shadow + border-color.
- Pipeline drag: immediate visual feedback, smooth drop animation.
- Chart data: recharts built-in animations (animationDuration 800ms).

No animation libraries needed beyond CSS transitions and recharts defaults.

The app should feel like a polished SaaS product that a real agency would
pay $200/month for. Fast, data-dense, thoughtfully organized.
Every interaction should feel deliberate and professional.
```

---

| Módulo | Detalle |
|---|---|
| Dashboard | 6 KPIs + 5 charts + 3 panels de actividad |
| Pipeline | Kanban drag & drop + lista + tabla + panel de detalle |
| Contactos | Tabla + tarjetas + página de detalle completa |
| Tareas | Lista agrupada + kanban + calendario |
| Correos | 3 paneles: folders / lista / contenido + compositor |
| Calendario | Mes / Semana / Día / Agenda |
| Reportes | Charts + funnel + tablas de rendimiento |
| Automatizaciones | Cards + builder visual con nodos |
| Equipo | Grid + panel de permisos + rendimiento |
| Productos | Tabla + drawer de edición |
| Documentos | Tabla + editor de propuestas inline |

