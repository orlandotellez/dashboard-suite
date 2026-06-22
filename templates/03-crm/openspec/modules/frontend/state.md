# State - Gestión de Estado con Zustand

## Visión General

Zustand stores para manejar toda la información del CRM en memoria.

---

## Stores Definidos

### 1. userStore

```typescript
interface UserStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  setCurrentUser: (user: User) => void;
}
```

### 2. contactsStore

```typescript
interface ContactsStore {
  contacts: Contact[];
  selectedContact: Contact | null;
  filters: ContactFilters;
  selectedIds: string[];
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  setSelectedContact: (contact: Contact | null) => void;
  setFilters: (filters: ContactFilters) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
}
```

### 3. dealsStore

```typescript
interface DealsStore {
  deals: Deal[];
  selectedDeal: Deal | null;
  filters: DealFilters;
  viewMode: 'kanban' | 'list' | 'table';
  setDeals: (deals: Deal[]) => void;
  addDeal: (deal: Deal) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  moveDeal: (dealId: string, newStage: PipelineStage) => void;
  setSelectedDeal: (deal: Deal | null) => void;
  setFilters: (filters: DealFilters) => void;
  setViewMode: (mode: 'kanban' | 'list' | 'table') => void;
}
```

### 4. tasksStore

```typescript
interface TasksStore {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilters;
  viewMode: 'list' | 'kanban' | 'calendar';
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  setSelectedTask: (task: Task | null) => void;
  setFilters: (filters: TaskFilters) => void;
  setViewMode: (mode: 'list' | 'kanban' | 'calendar') => void;
}
```

### 5. emailsStore

```typescript
interface EmailsStore {
  emails: Email[];
  selectedEmail: Email | null;
  currentFolder: 'inbox' | 'sent' | 'draft' | 'archived' | 'spam';
  filters: EmailFilters;
  setEmails: (emails: Email[]) => void;
  addEmail: (email: Email) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  deleteEmail: (id: string) => void;
  setSelectedEmail: (email: Email | null) => void;
  setCurrentFolder: (folder: string) => void;
  setFilters: (filters: EmailFilters) => void;
  markAsRead: (id: string) => void;
  toggleStar: (id: string) => void;
}
```

### 6. teamStore

```typescript
interface TeamStore {
  members: User[];
  invitations: Invitation[];
  selectedMember: User | null;
  setMembers: (members: User[]) => void;
  addMember: (member: User) => void;
  updateMember: (id: string, updates: Partial<User>) => void;
  removeMember: (id: string) => void;
  inviteMember: (invitation: Invitation) => void;
  cancelInvitation: (id: string) => void;
  resendInvitation: (id: string) => void;
  setSelectedMember: (member: User | null) => void;
}
```

### 7. productsStore

```typescript
interface ProductsStore {
  products: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setFilters: (filters: ProductFilters) => void;
}
```

### 8. documentsStore

```typescript
interface DocumentsStore {
  documents: Document[];
  selectedDocument: Document | null;
  filters: DocumentFilters;
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  setSelectedDocument: (document: Document | null) => void;
  setFilters: (filters: DocumentFilters) => void;
}
```

### 9. automationsStore

```typescript
interface AutomationsStore {
  automations: Automation[];
  selectedAutomation: Automation | null;
  setAutomations: (automations: Automation[]) => void;
  addAutomation: (automation: Automation) => void;
  updateAutomation: (id: string, updates: Partial<Automation>) => void;
  deleteAutomation: (id: string) => void;
  toggleAutomation: (id: string) => void;
  setSelectedAutomation: (automation: Automation | null) => void;
}
```

### 10. activityStore

```typescript
interface ActivityStore {
  activities: Activity[];
  filters: ActivityFilters;
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  setFilters: (filters: ActivityFilters) => void;
}
```

### 11. uiStore

```typescript
interface UIStore {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  notificationsOpen: boolean;
  activeModal: string | null;
  toasts: Toast[];
  toggleSidebar: () => void;
  setCommandPalette: (open: boolean) => void;
  setNotifications: (open: boolean) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
}
```

---

## Estructura de Store

```typescript
// Ejemplo de store básico
import { create } from 'zustand';

interface ContactStore {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  // ... más estados y acciones
}

export const useContactsStore = create<ContactStore>((set) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
}));
```

---

## Inicialización

- Cada store se inicializa con su mock data correspondiente
- Los datos se cargan al inicio de la aplicación
- No hay persistencia real (se resetea al recargar)

---

## Notas

- Todos los stores siguen el mismo patrón de Zustand
- Selectores para acceso eficiente a datos derivados
- Acciones síncronas (no hay efectos secundarios)