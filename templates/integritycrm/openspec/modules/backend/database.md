# Database - Estructura de Datos y Models

## Visión General

Definición de entidades y esquemas de datos para el CRM. Todo en memoria con Zustand.

---

## Entidades Principales

### 1. Contacto (Contact)

```typescript
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  avatar: string; // initials
  avatarColor: string;
  tags: string[];
  leadScore: number; // 0-100
  source: 'referral' | 'web' | 'cold-call' | 'event' | 'other';
  assigneeId: string;
  country: string;
  city: string;
  linkedin?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
}
```

**Relaciones:**
- Muchos → 1 Usuario (assignee)
- Uno → Muchas Oportunidades
- Uno → Muchos Emails
- Uno → Muchas Tareas

---

### 2. Oportunidad (Deal)

```typescript
interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  currency: 'USD' | 'MXN' | 'EUR';
  stage: PipelineStage;
  probability: number; // 0-100
  expectedCloseDate: Date;
  source: string;
  contactId: string;
  assigneeId: string;
  tags: string[];
  notes: string;
  activities: Activity[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
}

type PipelineStage =
  | 'prospecto'
  | 'contactado'
  | 'propuesta'
  | 'negociacion'
  | 'ganado'
  | 'perdido';
```

**Colores de Etapa:**
- Prospecto: #6B7280 (gray)
- Contactado: #2563EB (blue)
- Propuesta: #D97706 (amber)
- Negociación: #7C3AED (purple)
- Ganado: #16A34A (green)
- Perdido: #DC2626 (red)

---

### 3. Tarea (Task)

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  type: 'call' | 'meeting' | 'email' | 'task';
  priority: 'alta' | 'media' | 'baja';
  status: 'pendiente' | 'en_progreso' | 'revision' | 'completada';
  dueDate: Date;
  dueTime?: string;
  assigneeId: string;
  relatedType?: 'contact' | 'deal';
  relatedId?: string;
  subtasks: Subtask[];
  attachments: Attachment[];
  comments: Comment[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4. Email

```typescript
interface Email {
  id: string;
  threadId?: string;
  subject: string;
  body: string;
  from: {
    email: string;
    name: string;
    avatar: string;
  };
  to: string[];
  cc?: string[];
  folder: 'inbox' | 'sent' | 'draft' | 'archived' | 'spam';
  read: boolean;
  starred: boolean;
  hasAttachments: boolean;
  attachments: Attachment[];
  labels: string[];
  relatedContactId?: string;
  relatedDealId?: string;
  receivedAt: Date;
  createdAt: Date;
}
```

---

### 5. Producto

```typescript
interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  type: 'producto' | 'servicio' | 'suscripcion';
  price: number;
  currency: string;
  taxIncluded: boolean;
  discount?: number;
  billingPeriod?: 'mensual' | 'anual' | 'trimestral';
  status: 'active' | 'inactive';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 6. Documento

```typescript
interface Document {
  id: string;
  name: string;
  type: 'propuesta' | 'contrato' | 'cotizacion' | 'otro';
  status: 'borrador' | 'enviado' | 'visto' | 'firmado' | 'rechazado';
  clientId: string;
  dealId?: string;
  value?: number;
  content: DocumentSection[];
  attachments: Attachment[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  viewedAt?: Date;
}
```

---

### 7. Automatización

```typescript
interface Automation {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
  active: boolean;
  executionCount: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AutomationTrigger {
  type: 'new_contact' | 'stage_change' | 'email_received' | 'task_completed' | 'specific_date' | 'deal_won' | 'no_activity';
  params: Record<string, any>;
}

interface AutomationAction {
  type: 'send_email' | 'create_task' | 'update_field' | 'notify_user' | 'change_stage' | 'add_tag' | 'wait';
  params: Record<string, any>;
}
```

---

### 8. Actividad (Activity)

```typescript
interface Activity {
  id: string;
  type: 'contact_created' | 'deal_updated' | 'task_completed' | 'email_sent' | 'deal_won' | 'stage_changed';
  description: string;
  userId: string;
  relatedType?: 'contact' | 'deal' | 'task' | 'email';
  relatedId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
```

---

## Notas

- Todos los datos en Zustand stores
- IDs generados con crypto.randomUUID()
- Fechas en formato Date
- Estados inicializados con mock data provisto en spec