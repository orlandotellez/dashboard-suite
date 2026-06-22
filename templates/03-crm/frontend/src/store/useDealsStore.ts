import { create } from 'zustand'

export type DealStage = 'PROSPECTO' | 'CONTACTADO' | 'PROPUESTA' | 'NEGOCIACION' | 'GANADO' | 'PERDIDO'

export interface Deal {
  id: string
  title: string
  company: string
  value: number
  currency: string
  stage: DealStage
  probability: number
  expectedCloseDate?: string
  source: string
  tags: string[]
  notes?: string
  contactId?: string
  assigneeId?: string
  createdAt: string
}

interface DealsState {
  deals: Deal[]
  selectedDeal: Deal | null
  filters: { search?: string; stage?: DealStage; assigneeId?: string }
  viewMode: 'kanban' | 'list' | 'table'
  setDeals: (deals: Deal[]) => void
  setSelectedDeal: (deal: Deal | null) => void
  setFilters: (filters: DealsState['filters']) => void
  setViewMode: (mode: 'kanban' | 'list' | 'table') => void
  moveDeal: (dealId: string, newStage: DealStage) => void
  addDeal: (deal: Deal) => void
  updateDeal: (id: string, updates: Partial<Deal>) => void
  deleteDeal: (id: string) => void
}

// Mock data - 28 deals across pipeline stages
const mockDeals: Deal[] = [
  // Prospecto (6)
  { id: '1', title: 'TechCorp - Upgrade', company: 'TechCorp Solutions', value: 85000, currency: 'USD', stage: 'PROSPECTO', probability: 20, source: 'web', tags: ['enterprise'], createdAt: '2025-06-01' },
  { id: '2', title: 'Innova - CRM Migration', company: 'Innova Digital', value: 120000, currency: 'USD', stage: 'PROSPECTO', probability: 15, source: 'referral', tags: ['migration'], createdAt: '2025-06-10' },
  { id: '3', title: 'Global - Security', company: 'Global Ventures', value: 45000, currency: 'USD', stage: 'PROSPECTO', probability: 10, source: 'cold-call', tags: ['security'], createdAt: '2025-06-15' },
  { id: '4', title: 'Nexus - Cloud', company: 'Nexus Industries', value: 200000, currency: 'USD', stage: 'PROSPECTO', probability: 25, source: 'web', tags: ['cloud'], createdAt: '2025-06-18' },
  { id: '5', title: 'Stellar - DevOps', company: 'Stellar Systems', value: 65000, currency: 'USD', stage: 'PROSPECTO', probability: 30, source: 'evento', tags: ['devops'], createdAt: '2025-06-20' },
  { id: '6', title: 'CloudWorks - API', company: 'CloudWorks', value: 95000, currency: 'USD', stage: 'PROSPECTO', probability: 20, source: 'linkedin', tags: ['api'], createdAt: '2025-06-22' },

  // Contactado (5)
  { id: '7', title: 'DataPro - Analytics', company: 'DataPro Inc', value: 150000, currency: 'USD', stage: 'CONTACTADO', probability: 40, source: 'web', tags: ['analytics'], createdAt: '2025-05-15' },
  { id: '8', title: 'Alpha - Integration', company: 'Alpha Dynamics', value: 75000, currency: 'USD', stage: 'CONTACTADO', probability: 35, source: 'referral', tags: ['integration'], createdAt: '2025-05-20' },
  { id: '9', title: 'Prime - Support', company: 'Prime Solutions', value: 180000, currency: 'USD', stage: 'CONTACTADO', probability: 45, source: 'evento', tags: ['support'], createdAt: '2025-05-25' },
  { id: '10', title: 'Quantum - AI/ML', company: 'Quantum Labs', value: 55000, currency: 'USD', stage: 'CONTACTADO', probability: 40, source: 'web', tags: ['ai'], createdAt: '2025-06-01' },
  { id: '11', title: 'Nexus - Consulting', company: 'Nexus Industries', value: 90000, currency: 'USD', stage: 'CONTACTADO', probability: 50, source: 'cold-call', tags: ['consulting'], createdAt: '2025-06-05' },

  // Propuesta (5)
  { id: '12', title: 'TechCorp - Full Suite', company: 'TechCorp Solutions', value: 95000, currency: 'USD', stage: 'PROPUESTA', probability: 60, source: 'web', tags: ['enterprise'], createdAt: '2025-04-20' },
  { id: '13', title: 'Global - Expansion', company: 'Global Ventures', value: 220000, currency: 'USD', stage: 'PROPUESTA', probability: 55, source: 'referral', tags: ['expansion'], createdAt: '2025-04-25' },
  { id: '14', title: 'Stellar - Platform', company: 'Stellar Systems', value: 130000, currency: 'USD', stage: 'PROPUESTA', probability: 65, source: 'evento', tags: ['platform'], createdAt: '2025-05-01' },
  { id: '15', title: 'Innova - Training', company: 'Innova Digital', value: 85000, currency: 'USD', stage: 'PROPUESTA', probability: 70, source: 'web', tags: ['training'], createdAt: '2025-05-05' },
  { id: '16', title: 'Alpha - Support Plus', company: 'Alpha Dynamics', value: 45000, currency: 'USD', stage: 'PROPUESTA', probability: 75, source: 'linkedin', tags: ['support'], createdAt: '2025-05-10' },

  // Negociacion (4)
  { id: '17', title: 'DataPro - Enterprise', company: 'DataPro Inc', value: 175000, currency: 'USD', stage: 'NEGOCIACION', probability: 80, source: 'web', tags: ['enterprise'], createdAt: '2025-03-15' },
  { id: '18', title: 'Quantum - Full Stack', company: 'Quantum Labs', value: 110000, currency: 'USD', stage: 'NEGOCIACION', probability: 85, source: 'referral', tags: ['fullstack'], createdAt: '2025-03-20' },
  { id: '19', title: 'CloudWorks - Premium', company: 'CloudWorks', value: 95000, currency: 'USD', stage: 'NEGOCIACION', probability: 90, source: 'web', tags: ['premium'], createdAt: '2025-04-01' },
  { id: '20', title: 'Prime - Ultimate', company: 'Prime Solutions', value: 65000, currency: 'USD', stage: 'NEGOCIACION', probability: 85, source: 'evento', tags: ['ultimate'], createdAt: '2025-04-05' },

  // Ganado (5)
  { id: '21', title: 'TechCorp - Initial', company: 'TechCorp Solutions', value: 150000, currency: 'USD', stage: 'GANADO', probability: 100, source: 'referral', tags: ['enterprise'], createdAt: '2025-02-10' },
  { id: '22', title: 'Innova - Starter', company: 'Innova Digital', value: 85000, currency: 'USD', stage: 'GANADO', probability: 100, source: 'web', tags: ['starter'], createdAt: '2025-02-15' },
  { id: '23', title: 'Nexus - Growth', company: 'Nexus Industries', value: 200000, currency: 'USD', stage: 'GANADO', probability: 100, source: 'evento', tags: ['growth'], createdAt: '2025-03-01' },
  { id: '24', title: 'Stellar - Scale', company: 'Stellar Systems', value: 120000, currency: 'USD', stage: 'GANADO', probability: 100, source: 'linkedin', tags: ['scale'], createdAt: '2025-03-10' },
  { id: '25', title: 'Prime - Business', company: 'Prime Solutions', value: 75000, currency: 'USD', stage: 'GANADO', probability: 100, source: 'referral', tags: ['business'], createdAt: '2025-03-15' },

  // Perdido (3)
  { id: '26', title: 'CloudWorks - Basic', company: 'CloudWorks', value: 90000, currency: 'USD', stage: 'PERDIDO', probability: 0, source: 'web', tags: ['basic'], createdAt: '2025-01-20' },
  { id: '27', title: 'Alpha - Demo', company: 'Alpha Dynamics', value: 55000, currency: 'USD', stage: 'PERDIDO', probability: 0, source: 'cold-call', tags: ['demo'], createdAt: '2025-01-25' },
  { id: '28', title: 'Quantum - Trial', company: 'Quantum Labs', value: 40000, currency: 'USD', stage: 'PERDIDO', probability: 0, source: 'web', tags: ['trial'], createdAt: '2025-02-01' },
]

export const useDealsStore = create<DealsState>((set) => ({
  deals: mockDeals,
  selectedDeal: null,
  filters: {},
  viewMode: 'kanban',

  setDeals: (deals) => set({ deals }),
  setSelectedDeal: (selectedDeal) => set({ selectedDeal }),
  setFilters: (filters) => set({ filters }),
  setViewMode: (viewMode) => set({ viewMode }),

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
}))