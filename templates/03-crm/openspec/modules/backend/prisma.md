# Prisma Schema - Modelos de Datos

## Schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===========================================
// USUARIOS Y AUTH
// ===========================================

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String
  password      String
  role          Role      @default(STAFF)
  avatar        String?
  avatarColor   String    @default("#2563EB")
  team          String?
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  // Relations
  assignedContacts  Contact[]    @relation("AssignedUser")
  assignedDeals     Deal[]       @relation("AssignedUser")
  assignedTasks     Task[]       @relation("AssignedUser")
  activities        Activity[]
  comments          Comment[]
  createdDeals      Deal[]       @relation("CreatedBy")
  createdContacts   Contact[]    @relation("CreatedBy")
  createdTasks      Task[]      @relation("CreatedBy")

  @@index([email])
  @@index([role])
  @@map("users")
}

enum Role {
  ADMIN
  MANAGER
  VENDEDOR
  SOLO_LECTURA
}

// ===========================================
// CONTACTOS
// ===========================================

model Contact {
  id            String    @id @default(uuid())
  name          String
  email         String
  phone         String?
  company       String
  role          String?   // cargo en la empresa
  avatar        String?
  avatarColor   String    @default("#7C3AED")
  tags          String[]  // stored as JSON array
  leadScore     Int       @default(0)
  source         String?   // referral, web, cold-call, event, other
  country       String?
  city          String?
  linkedin      String?
  notes         String?   @db.Text

  // Relations
  assigneeId    String?
  assignee      User?     @relation("AssignedUser", fields: [assigneeId], references: [id])

  createdById   String?
  createdBy    User?     @relation("CreatedBy", fields: [createdById], references: [id])

  deals         Deal[]
  tasks         Task[]    @relation("ContactTasks")
  emails        Email[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  @@index([email])
  @@index([company])
  @@index([assigneeId])
  @@map("contacts")
}

// ===========================================
// OPORTUNIDADES (DEALS)
// ===========================================

model Deal {
  id                  String        @id @default(uuid())
  title               String
  company             String
  value               Decimal       @db.Decimal(12, 2)
  currency            String        @default("USD") // USD, MXN, EUR
  stage               DealStage     @default(PROSPECTO)
  probability         Int           @default(0) // 0-100
  expectedCloseDate   DateTime?
  source              String?
  tags                String[]      // stored as JSON array
  notes               String?       @db.Text

  // Relations
  contactId           String?
  contact             Contact?      @relation(fields: [contactId], references: [id])

  assigneeId          String?
  assignee            User?         @relation("AssignedUser", fields: [assigneeId], references: [id])

  createdById         String?
  createdBy           User?         @relation("CreatedBy", fields: [createdById], references: [id])

  activities           Activity[]
  documents           Document[]
  tasks               Task[]        @relation("DealTasks")

  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  deletedAt           DateTime?

  @@index([stage])
  @@index([assigneeId])
  @@index([contactId])
  @@map("deals")
}

enum DealStage {
  PROSPECTO
  CONTACTADO
  PROPUESTA
  NEGOCIACION
  GANADO
  PERDIDO
}

// ===========================================
// TAREAS
// ===========================================

model Task {
  id            String      @id @default(uuid())
  title         String
  description   String?     @db.Text
  type          TaskType    @default(TAREA)
  priority      TaskPriority @default(MEDIA)
  status        TaskStatus  @default(PENDIENTE)
  dueDate       DateTime?
  dueTime       String?     // HH:mm format

  // Relations
  assigneeId    String?
  assignee      User?       @relation("AssignedUser", fields: [assigneeId], references: [id])

  relatedType   String?     // 'contact' or 'deal'
  relatedId     String?

  contact       Contact?    @relation("ContactTasks", fields: [relatedId], references: [id], map: "task_contact_fk")
  deal          Deal?       @relation("DealTasks", fields: [relatedId], references: [id], map: "task_deal_fk")

  subtasks      Subtask[]
  comments      Comment[]
  attachments   Attachment[]

  completedAt   DateTime?

  createdById   String?
  createdBy     User?       @relation("CreatedBy", fields: [createdById], references: [id])

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  deletedAt     DateTime?

  @@index([status])
  @@index([assigneeId])
  @@index([dueDate])
  @@map("tasks")
}

enum TaskType {
  LLAMADA
  REUNION
  EMAIL
  TAREA
}

enum TaskPriority {
  ALTA
  MEDIA
  BAJA
}

enum TaskStatus {
  PENDIENTE
  EN_PROGRESO
  REVISION
  COMPLETADA
}

model Subtask {
  id        String   @id @default(uuid())
  title     String
  done      Boolean  @default(false)

  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("subtasks")
}

// ===========================================
// CORREOS
// ===========================================

model Email {
  id              String      @id @default(uuid())
  threadId        String?     // para grouping de hilos
  subject         String
  body            String      @db.Text
  fromEmail       String
  fromName        String
  fromAvatar      String?
  toEmail         String      // JSON array stored as string
  ccEmail         String?     // JSON array stored as string
  folder          EmailFolder @default(INBOX)
  read            Boolean     @default(false)
  starred         Boolean     @default(false)
  hasAttachments  Boolean     @default(false)
  labels          String[]    // stored as JSON array

  // Relations
  contactId       String?
  contact         Contact?    @relation(fields: [contactId], references: [id])

  dealId          String?
  deal            Deal?       @relation(fields: [dealId], references: [id])

  attachments     Attachment[]

  receivedAt      DateTime    @default(now())
  createdAt       DateTime    @default(now())
  deletedAt       DateTime?

  @@index([folder])
  @@index([read])
  @@index([contactId])
  @@map("emails")
}

enum EmailFolder {
  INBOX
  SENT
  DRAFT
  ARCHIVED
  SPAM
}

model Attachment {
  id          String   @id @default(uuid())
  filename    String
  originalName String
  mimeType    String
  size        Int      // bytes
  url         String   // path or URL

  // Relations
  emailId     String?
  email       Email?   @relation(fields: [emailId], references: [id])

  taskId      String?
  task        Task?    @relation(fields: [taskId], references: [id])

  documentId  String?
  document    Document? @relation(fields: [documentId], references: [id])

  createdAt   DateTime @default(now())

  @@map("attachments")
}

// ===========================================
// PRODUCTOS
// ===========================================

model Product {
  id              String        @id @default(uuid())
  name            String
  sku             String        @unique
  description     String?       @db.Text
  category        String?
  type            ProductType   @default(PRODUCTO)
  price           Decimal       @db.Decimal(10, 2)
  currency        String        @default("USD")
  taxIncluded     Boolean       @default(false)
  discount        Decimal?      @db.Decimal(5, 2) // percentage
  billingPeriod   String?       // mensual, anual, trimestral
  status          ProductStatus @default(ACTIVE)
  tags            String[]      // stored as JSON array
  notes           String?       @db.Text

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?

  @@index([category])
  @@index([status])
  @@map("products")
}

enum ProductType {
  PRODUCTO
  SERVICIO
  SUSCRIPCION
}

enum ProductStatus {
  ACTIVE
  INACTIVE
}

// ===========================================
// DOCUMENTOS
// ===========================================

model Document {
  id          String         @id @default(uuid())
  name        String
  type        DocumentType   @default(PROPUESTA)
  status      DocumentStatus @default(BORRADOR)
  content     Json?          // structured document content

  // Relations
  clientId    String?
  client      Contact?       @relation(fields: [clientId], references: [id])

  dealId      String?
  deal        Deal?          @relation(fields: [dealId], references: [id])

  value       Decimal?       @db.Decimal(12, 2)

  createdById String?
  createdBy   User?          @relation("CreatedBy", fields: [createdById], references: [id])

  attachments Attachment[]

  sentAt      DateTime?
  viewedAt    DateTime?

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  deletedAt   DateTime?

  @@index([status])
  @@index([clientId])
  @@map("documents")
}

enum DocumentType {
  PROPUESTA
  CONTRATO
  COTIZACION
  OTRO
}

enum DocumentStatus {
  BORRADOR
  ENVIADO
  VISTO
  FIRMADO
  RECHAZADO
}

// ===========================================
// AUTOMATIZACIONES
// ===========================================

model Automation {
  id              String   @id @default(uuid())
  name            String
  description     String?
  icon            String?
  iconColor       String?
  triggerType     String   // new_contact, stage_change, etc.
  triggerParams   Json?    // trigger configuration
  conditions      Json?    // conditional logic
  actions         Json     // action array
  active          Boolean  @default(false)

  executionCount  Int      @default(0)
  lastExecutedAt  DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  @@index([active])
  @@map("automations")
}

// ===========================================
// ACTIVIDADES (AUDIT LOG)
// ===========================================

model Activity {
  id          String        @id @default(uuid())
  type        String        // contact_created, deal_updated, etc.
  description String
  metadata    Json?         // additional data

  // Relations
  userId      String?
  user        User?         @relation(fields: [userId], references: [id])

  relatedType String?       // contact, deal, task, email
  relatedId   String?

  createdAt   DateTime      @default(now())

  @@index([userId])
  @@index([relatedType, relatedId])
  @@map("activities")
}

// ===========================================
// COMENTARIOS
// ===========================================

model Comment {
  id          String   @id @default(uuid())
  content     String   @db.Text

  // Relations
  taskId      String?
  task        Task?    @relation(fields: [taskId], references: [id])

  userId      String?
  user        User?    @relation(fields: [userId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("comments")
}

// ===========================================
// INVITACIONES DE EQUIPO
// ===========================================

model Invitation {
  id          String           @id @default(uuid())
  email       String
  role        Role             @default(VENDEDOR)
  team        String?
  status      InvitationStatus @default(PENDIENTE)

  invitedById String?
  expiresAt   DateTime

  createdAt   DateTime         @default(now())

  @@index([email])
  @@map("invitations")
}

enum InvitationStatus {
  PENDIENTE
  ACEPTADA
  EXPIRADA
  CANCELADA
}
```