// User types
export interface User {
  id: string
  email: string
  name: string
  password: string
  role: Role
  avatar?: string
  avatarColor: string
  team?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export type Role = 'ADMIN' | 'MANAGER' | 'VENDEDOR' | 'STAFF' | 'SOLO_LECTURA'

// Contact types
export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  role?: string
  avatar?: string
  avatarColor: string
  tags: string[]
  leadScore: number
  source?: string
  country?: string
  city?: string
  linkedin?: string
  notes?: string
  assigneeId?: string
  createdById?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

// Deal types
export interface Deal {
  id: string
  title: string
  company: string
  value: number
  currency: string
  stage: DealStage
  probability: number
  expectedCloseDate?: Date
  source?: string
  tags: string[]
  notes?: string
  contactId?: string
  assigneeId?: string
  createdById?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export type DealStage = 'PROSPECTO' | 'CONTACTADO' | 'PROPUESTA' | 'NEGOCIACION' | 'GANADO' | 'PERDIDO'

// Task types
export interface Task {
  id: string
  title: string
  description?: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  dueDate?: Date
  dueTime?: string
  assigneeId?: string
  relatedType?: 'contact' | 'deal'
  relatedId?: string
  completedAt?: Date
  createdById?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export type TaskType = 'LLAMADA' | 'REUNION' | 'EMAIL' | 'TAREA'
export type TaskPriority = 'ALTA' | 'MEDIA' | 'BAJA'
export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'REVISION' | 'COMPLETADA'

// Email types
export interface Email {
  id: string
  threadId?: string
  subject: string
  body: string
  fromEmail: string
  fromName: string
  fromAvatar?: string
  toEmail: string
  ccEmail?: string
  folder: EmailFolder
  read: boolean
  starred: boolean
  hasAttachments: boolean
  labels: string[]
  contactId?: string
  dealId?: string
  receivedAt: Date
  createdAt: Date
  deletedAt?: Date
}

export type EmailFolder = 'INBOX' | 'SENT' | 'DRAFT' | 'ARCHIVED' | 'SPAM'

// Product types
export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  category?: string
  type: ProductType
  price: number
  currency: string
  taxIncluded: boolean
  discount?: number
  billingPeriod?: string
  status: ProductStatus
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export type ProductType = 'PRODUCTO' | 'SERVICIO' | 'SUSCRIPCION'
export type ProductStatus = 'ACTIVE' | 'INACTIVE'

// Document types
export interface Document {
  id: string
  name: string
  type: DocumentType
  status: DocumentStatus
  content?: Record<string, unknown>
  clientId?: string
  dealId?: string
  value?: number
  createdById?: string
  sentAt?: Date
  viewedAt?: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export type DocumentType = 'PROPUESTA' | 'CONTRATO' | 'COTIZACION' | 'OTRO'
export type DocumentStatus = 'BORRADOR' | 'ENVIADO' | 'VISTO' | 'FIRMADO' | 'RECHAZADO'

// Automation types
export interface Automation {
  id: string
  name: string
  description?: string
  icon?: string
  iconColor?: string
  triggerType: string
  triggerParams?: Record<string, unknown>
  conditions?: Record<string, unknown>
  actions: Record<string, unknown>[]
  active: boolean
  executionCount: number
  lastExecutedAt?: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

// Activity types
export interface Activity {
  id: string
  type: string
  description: string
  metadata?: Record<string, unknown>
  userId?: string
  relatedType?: string
  relatedId?: string
  createdAt: Date
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}