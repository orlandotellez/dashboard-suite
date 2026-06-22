import { create } from 'zustand'

export type TaskType = 'LLAMADA' | 'REUNION' | 'EMAIL' | 'TAREA'
export type TaskPriority = 'ALTA' | 'MEDIA' | 'BAJA'
export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'REVISION' | 'COMPLETADA'

export interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  dueTime?: string
  assigneeId: string
  relatedType?: 'contact' | 'deal'
  relatedId?: string
  completedAt?: string
  createdAt: string
}

interface TasksState {
  tasks: Task[]
  selectedTask: Task | null
  filters: { status?: TaskStatus; assigneeId?: string; priority?: TaskPriority }
  viewMode: 'list' | 'kanban' | 'calendar'
  setTasks: (tasks: Task[]) => void
  setSelectedTask: (task: Task | null) => void
  setFilters: (filters: TasksState['filters']) => void
  setViewMode: (mode: 'list' | 'kanban' | 'calendar') => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
}

// Mock data - 35 tasks
const mockTasks: Task[] = [
  // Pendientes (8)
  { id: '1', title: 'Llamar a Roberto - TechCorp', description: 'Seguimiento de propuesta', type: 'LLAMADA', priority: 'ALTA', status: 'PENDIENTE', dueDate: '2025-07-15', dueTime: '10:00', assigneeId: '1', createdAt: '2025-07-10' },
  { id: '2', title: 'Preparar presentación Global', description: 'Demo para proyecto expansion', type: 'TAREA', priority: 'ALTA', status: 'PENDIENTE', dueDate: '2025-07-16', assigneeId: '1', createdAt: '2025-07-11' },
  { id: '3', title: 'Revisar propuesta Innova', description: 'Documentation de migración', type: 'TAREA', priority: 'MEDIA', status: 'PENDIENTE', dueDate: '2025-07-17', assigneeId: '2', createdAt: '2025-07-12' },
  { id: '4', title: 'Enviar cotizacion Alpha', description: 'Soporte plus - 3 años', type: 'EMAIL', priority: 'MEDIA', status: 'PENDIENTE', dueDate: '2025-07-18', assigneeId: '2', createdAt: '2025-07-13' },
  { id: '5', title: 'Reunion con Quantum', description: 'Kickoff proyecto full stack', type: 'REUNION', priority: 'ALTA', status: 'PENDIENTE', dueDate: '2025-07-15', dueTime: '14:00', assigneeId: '1', createdAt: '2025-07-10' },
  { id: '6', title: 'Actualizar CRM datos', description: 'Limpieza de contactos duplicados', type: 'TAREA', priority: 'BAJA', status: 'PENDIENTE', dueDate: '2025-07-20', assigneeId: '3', createdAt: '2025-07-14' },
  { id: '7', title: 'Follow-up DataPro', description: 'Segunda llamada - analytics', type: 'LLAMADA', priority: 'MEDIA', status: 'PENDIENTE', assigneeId: '2', createdAt: '2025-07-14' },
  { id: '8', title: 'Preparar informe mensual', description: 'Reporte de ventas junio', type: 'TAREA', priority: 'MEDIA', status: 'PENDIENTE', dueDate: '2025-07-31', assigneeId: '1', createdAt: '2025-07-14' },

  // En Progreso (6)
  { id: '9', title: 'Demo Stellar Systems', description: 'Plataforma completa', type: 'REUNION', priority: 'ALTA', status: 'EN_PROGRESO', dueDate: '2025-07-15', dueTime: '11:00', assigneeId: '1', createdAt: '2025-07-12' },
  { id: '10', title: 'Negociar contrato Prime', description: 'Valor: $65K - etapa negociacion', type: 'TAREA', priority: 'ALTA', status: 'EN_PROGRESO', dueDate: '2025-07-16', assigneeId: '2', createdAt: '2025-07-10' },
  { id: '11', title: 'Investigacion competidores', description: 'Analisis de mercado', type: 'TAREA', priority: 'BAJA', status: 'EN_PROGRESO', assigneeId: '3', createdAt: '2025-07-13' },
  { id: '12', title: 'Enviar propuesta TechCorp', description: 'Full suite enterprise', type: 'EMAIL', priority: 'ALTA', status: 'EN_PROGRESO', dueDate: '2025-07-15', assigneeId: '1', createdAt: '2025-07-14' },
  { id: '13', title: 'Llamada de cierre DataPro', description: ' Cerrar deal de $175K', type: 'LLAMADA', priority: 'ALTA', status: 'EN_PROGRESO', dueDate: '2025-07-17', assigneeId: '2', createdAt: '2025-07-14' },
  { id: '14', title: 'Actualizar pipeline CloudWorks', description: 'Mover deals de etapa', type: 'TAREA', priority: 'MEDIA', status: 'EN_PROGRESO', assigneeId: '3', createdAt: '2025-07-14' },

  // Completadas (21)
  { id: '15', title: 'Llamada inicial Roberto', description: 'Descubrir necesidades', type: 'LLAMADA', priority: 'ALTA', status: 'COMPLETADA', dueDate: '2025-07-10', completedAt: '2025-07-10', assigneeId: '1', createdAt: '2025-07-08' },
  { id: '16', title: 'Reunion de kickoff', description: 'Con equipo de Innova', type: 'REUNION', priority: 'MEDIA', status: 'COMPLETADA', dueDate: '2025-07-08', completedAt: '2025-07-08', assigneeId: '2', createdAt: '2025-07-05' },
  { id: '17', title: 'Enviar brochure', description: 'PDF con features', type: 'EMAIL', priority: 'BAJA', status: 'COMPLETADA', completedAt: '2025-07-09', assigneeId: '3', createdAt: '2025-07-07' },
]

export const useTasksStore = create<TasksState>((set) => ({
  tasks: mockTasks,
  selectedTask: null,
  filters: {},
  viewMode: 'list',

  setTasks: (tasks) => set({ tasks }),
  setSelectedTask: (selectedTask) => set({ selectedTask }),
  setFilters: (filters) => set({ filters }),
  setViewMode: (viewMode) => set({ viewMode }),

  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  completeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: 'COMPLETADA', completedAt: new Date().toISOString() } : t
      ),
    })),
}))