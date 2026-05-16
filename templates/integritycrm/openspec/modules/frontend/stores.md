# Stores - Zustand State Management

## store/useAuthStore.ts

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'VENDEDOR' | 'SOLO_LECTURA';
  avatar?: string;
  avatarColor: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      login: (user, accessToken) => {
        set({ user, isAuthenticated: true, accessToken });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, accessToken: null });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

---

## store/useSideBarStore.ts

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SideBarStore {
  collapsed: boolean;
  setCollapsed: () => void;
}

export const useSideBarStore = create<SideBarStore>()(
  persist(
    (set) => ({
      collapsed: false,
      setCollapsed: () => {
        set((state) => ({ collapsed: !state.collapsed }));
      },
    }),
    {
      name: 'sidebar-storage',
    }
  )
);
```

---

## store/useContactsStore.ts

```typescript
import { create } from 'zustand';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  role?: string;
  avatar?: string;
  avatarColor: string;
  tags: string[];
  leadScore: number;
  source?: string;
  country?: string;
  city?: string;
  linkedin?: string;
  notes?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactFilters {
  search?: string;
  assigneeId?: string;
  tags?: string[];
  company?: string;
}

interface ContactsState {
  contacts: Contact[];
  selectedContact: Contact | null;
  filters: ContactFilters;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  setContacts: (contacts: Contact[]) => void;
  setSelectedContact: (contact: Contact | null) => void;
  setFilters: (filters: ContactFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
}

export const useContactsStore = create<ContactsState>((set) => ({
  contacts: [],
  selectedContact: null,
  filters: {},
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },

  setContacts: (contacts) => set({ contacts }),
  setSelectedContact: (selectedContact) => set({ selectedContact }),
  setFilters: (filters) => set({ filters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addContact: (contact) =>
    set((state) => ({ contacts: [contact, ...state.contacts] })),

  updateContact: (id, updates) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  deleteContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    })),
}));
```

---

## store/useDealsStore.ts

```typescript
import { create } from 'zustand';

type DealStage = 'PROSPECTO' | 'CONTACTADO' | 'PROPUESTA' | 'NEGOCIACION' | 'GANADO' | 'PERDIDO';

interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedCloseDate?: string;
  source?: string;
  tags: string[];
  notes?: string;
  contactId?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

interface DealFilters {
  search?: string;
  stage?: DealStage;
  assigneeId?: string;
  minValue?: number;
  maxValue?: number;
}

interface DealsState {
  deals: Deal[];
  selectedDeal: Deal | null;
  filters: DealFilters;
  viewMode: 'kanban' | 'list' | 'table';
  loading: boolean;
  error: string | null;

  setDeals: (deals: Deal[]) => void;
  setSelectedDeal: (deal: Deal | null) => void;
  setFilters: (filters: DealFilters) => void;
  setViewMode: (mode: 'kanban' | 'list' | 'table') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  moveDeal: (dealId: string, newStage: DealStage) => void;
  addDeal: (deal: Deal) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
}

export const useDealsStore = create<DealsState>((set) => ({
  deals: [],
  selectedDeal: null,
  filters: {},
  viewMode: 'kanban',
  loading: false,
  error: null,

  setDeals: (deals) => set({ deals }),
  setSelectedDeal: (selectedDeal) => set({ selectedDeal }),
  setFilters: (filters) => set({ filters }),
  setViewMode: (viewMode) => set({ viewMode }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  moveDeal: (dealId, newStage) =>
    set((state) => ({
      deals: state.deals.map((d) =>
        d.id === dealId ? { ...d, stage: newStage } : d
      ),
    })),

  addDeal: (deal) => set((state) => ({ deals: [deal, ...state.deals] })),

  updateDeal: (id, updates) =>
    set((state) => ({
      deals: state.deals.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),

  deleteDeal: (id) =>
    set((state) => ({ deals: state.deals.filter((d) => d.id !== id) })),
}));
```

---

## store/useUIStore.ts

```typescript
import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface UIState {
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
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  notificationsOpen: false,
  activeModal: null,
  toasts: [],

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setCommandPalette: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setNotifications: (notificationsOpen) => set({ notificationsOpen }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal }),

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
```

---

## Patrón para Nuevos Stores

```typescript
// store/use{Entity}Store.ts
import { create } from 'zustand';

interface Entity {
  id: string;
  // ... properties
}

interface EntityState {
  entities: Entity[];
  selectedEntity: Entity | null;
  loading: boolean;
  error: string | null;

  // Actions
  setEntities: (entities: Entity[]) => void;
  setSelectedEntity: (entity: Entity | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEntityStore = create<EntityState>((set) => ({
  entities: [],
  selectedEntity: null,
  loading: false,
  error: null,

  setEntities: (entities) => set({ entities }),
  setSelectedEntity: (selectedEntity) => set({ selectedEntity }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
```