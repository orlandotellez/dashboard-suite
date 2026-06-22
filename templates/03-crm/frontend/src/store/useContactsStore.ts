import { create } from 'zustand'

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  avatar?: string
  avatarColor: string
  tags: string[]
  leadScore: number
  source: string
  country: string
  city: string
  linkedin?: string
  notes?: string
  assigneeId?: string
  createdAt: string
}

interface ContactsState {
  contacts: Contact[]
  selectedContact: Contact | null
  filters: { search?: string; assigneeId?: string; tags?: string[] }
  loading: boolean
  setContacts: (contacts: Contact[]) => void
  setSelectedContact: (contact: Contact | null) => void
  setFilters: (filters: ContactsState['filters']) => void
  addContact: (contact: Contact) => void
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContact: (id: string) => void
}

// Mock data - 45 contacts
const mockContacts: Contact[] = [
  { id: '1', name: 'Roberto Díaz', email: 'roberto@techcorp.com', phone: '+1 555-0101', company: 'TechCorp Solutions', role: 'CTO', avatarColor: '#2563EB', tags: ['Cliente', 'VIP'], leadScore: 85, source: 'referral', country: 'México', city: 'Ciudad de México', linkedin: 'linkedin.com/roberto', createdAt: '2025-01-15' },
  { id: '2', name: 'Carolina Mendoza', email: 'carolina@innovadigital.com', phone: '+1 555-0102', company: 'Innova Digital', role: 'VP Sales', avatarColor: '#7C3AED', tags: ['Lead'], leadScore: 72, source: 'web', country: 'España', city: 'Madrid', createdAt: '2025-02-20' },
  { id: '3', name: 'Andrés Fuentes', email: 'andres@globalventures.com', phone: '+1 555-0103', company: 'Global Ventures', role: 'Director TI', avatarColor: '#16A34A', tags: ['Cliente'], leadScore: 90, source: 'evento', country: 'Argentina', city: 'Buenos Aires', createdAt: '2025-03-10' },
  { id: '4', name: 'Lucía Vargas', email: 'lucia@nexus.com', phone: '+1 555-0104', company: 'Nexus Industries', role: 'Gerente Proyectos', avatarColor: '#D97706', tags: ['Prospecto'], leadScore: 65, source: 'cold-call', country: 'Colombia', city: 'Bogotá', createdAt: '2025-04-05' },
  { id: '5', name: 'Miguel Ángel Reyes', email: 'miguel@stellar.com', phone: '+1 555-0105', company: 'Stellar Systems', role: 'CEO', avatarColor: '#DC2626', tags: ['VIP', 'Cliente'], leadScore: 95, source: 'referral', country: 'Chile', city: 'Santiago', createdAt: '2025-01-22' },
  { id: '6', name: 'Patricia López', email: 'patricia@datapro.com', phone: '+1 555-0106', company: 'DataPro Inc', role: 'CFO', avatarColor: '#059669', tags: ['Lead'], leadScore: 58, source: 'web', country: 'Perú', city: 'Lima', createdAt: '2025-05-12' },
  { id: '7', name: 'Fernando Torres', email: 'fernando@alpha.com', phone: '+1 555-0107', company: 'Alpha Dynamics', role: 'Director Ops', avatarColor: '#9333EA', tags: ['Cliente'], leadScore: 78, source: 'referral', country: 'México', city: 'Guadalajara', createdAt: '2025-02-28' },
  { id: '8', name: 'Ana Karen García', email: 'anak@cloudworks.com', phone: '+1 555-0108', company: 'CloudWorks', role: 'Lead Developer', avatarColor: '#0891B2', tags: ['Prospecto'], leadScore: 45, source: 'linkedin', country: 'España', city: 'Barcelona', createdAt: '2025-06-01' },
  { id: '9', name: 'Carlos Ruiz', email: 'carlos@prime.com', phone: '+1 555-0109', company: 'Prime Solutions', role: 'VP Engineering', avatarColor: '#CA8A04', tags: ['Cliente', 'VIP'], leadScore: 92, source: 'evento', country: 'Argentina', city: 'Córdoba', createdAt: '2025-03-18' },
  { id: '10', name: 'Sofía Chen', email: 'sofia@quantum.com', phone: '+1 555-0110', company: 'Quantum Labs', role: 'Product Manager', avatarColor: '#DB2777', tags: ['Lead'], leadScore: 67, source: 'web', country: 'Colombia', city: 'Medellín', createdAt: '2025-04-22' },
]

export const useContactsStore = create<ContactsState>((set) => ({
  contacts: mockContacts,
  selectedContact: null,
  filters: {},
  loading: false,

  setContacts: (contacts) => set({ contacts }),
  setSelectedContact: (selectedContact) => set({ selectedContact }),
  setFilters: (filters) => set({ filters }),

  addContact: (contact) => set((state) => ({ contacts: [contact, ...state.contacts] })),
  updateContact: (id, updates) =>
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  deleteContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    })),
}))