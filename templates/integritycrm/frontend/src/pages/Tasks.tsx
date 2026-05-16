import { useState, useMemo } from 'react'
import { Search, Plus, List, LayoutGrid, Calendar } from 'lucide-react'
import { useTasksStore } from '@/store/useTasksStore'
import styles from './Tasks.module.css'

export default function Tasks() {
  const { tasks, completeTask } = useTasksStore()
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list')

  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof tasks> = {
      'Hoy': [],
      'Mañana': [],
      'Esta semana': [],
      'Más adelante': [],
      'Vencidas': [],
    }

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

    tasks.forEach(task => {
      if (task.status === 'COMPLETADA') return
      if (!task.dueDate) {
        groups['Más adelante'].push(task)
        return
      }

      if (task.dueDate < today) {
        groups['Vencidas'].push(task)
      } else if (task.dueDate === today) {
        groups['Hoy'].push(task)
      } else if (task.dueDate === tomorrow) {
        groups['Mañana'].push(task)
      } else if (task.dueDate <= weekEnd) {
        groups['Esta semana'].push(task)
      } else {
        groups['Más adelante'].push(task)
      }
    })

    return groups
  }, [tasks])

  const toggleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && task.status !== 'COMPLETADA') {
      completeTask(taskId)
    }
  }

  return (
    <div className={styles.tasks}>
      <div className={styles.header}>
        <h1>Tareas</h1>

        <div className={styles.badges}>
          <span className={styles.badge}>Hoy: {groupedTasks['Hoy'].length}</span>
          <span className={styles.badge}>Próximas: {groupedTasks['Esta semana'].length + groupedTasks['Mañana'].length}</span>
          <span className={styles.badgeDanger}>Vencidas: {groupedTasks['Vencidas'].length}</span>
        </div>

        <div className={styles.actions}>
          <div className={styles.viewToggle}>
            <button className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`} onClick={() => setViewMode('list')}>
              <List size={16} />
            </button>
            <button className={`${styles.viewBtn} ${viewMode === 'kanban' ? styles.active : ''}`} onClick={() => setViewMode('kanban')}>
              <LayoutGrid size={16} />
            </button>
            <button className={`${styles.viewBtn} ${viewMode === 'calendar' ? styles.active : ''}`} onClick={() => setViewMode('calendar')}>
              <Calendar size={16} />
            </button>
          </div>

          <button className={styles.primaryBtn}>
            <Plus size={16} />
            Nueva tarea
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className={styles.listView}>
          {Object.entries(groupedTasks).map(([group, groupTasks]) => {
            if (groupTasks.length === 0) return null
            return (
              <div key={group} className={styles.group}>
                <div className={styles.groupHeader}>
                  <span>{group}</span>
                  <span className={styles.groupCount}>{groupTasks.length}</span>
                </div>
                {groupTasks.map(task => (
                  <div key={task.id} className={styles.taskRow}>
                    <button
                      className={`${styles.checkbox} ${task.status === 'COMPLETADA' ? styles.checked : ''}`}
                      onClick={() => toggleComplete(task.id)}
                    >
                      {task.status === 'COMPLETADA' && '✓'}
                    </button>
                    <span className={`${styles.taskTitle} ${task.status === 'COMPLETADA' ? styles.completed : ''}`}>
                      {task.title}
                    </span>
                    <span className={`${styles.priority} ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    {task.dueTime && <span className={styles.time}>{task.dueTime}</span>}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className={styles.kanbanBoard}>
          {['PENDIENTE', 'EN_PROGRESO', 'REVISION', 'COMPLETADA'].map(stage => (
            <div key={stage} className={styles.kanbanCol}>
              <div className={styles.kanbanHeader}>
                <span>{stage.replace('_', ' ')}</span>
                <span className={styles.colCount}>
                  {tasks.filter(t => t.status === stage).length}
                </span>
              </div>
              <div className={styles.kanbanContent}>
                {tasks.filter(t => t.status === stage).map(task => (
                  <div key={task.id} className={styles.kanbanCard}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <div className={styles.cardMeta}>
                      <span className={`${styles.priority} ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}