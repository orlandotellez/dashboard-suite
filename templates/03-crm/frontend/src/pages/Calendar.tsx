import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Calendar.module.css'

const events = [
  { id: 1, title: 'Demo con TechCorp', type: 'demo', date: '2025-07-15', time: '10:00' },
  { id: 2, title: 'Llamada con María', type: 'llamada', date: '2025-07-15', time: '14:00' },
  { id: 3, title: 'Reunión equipo', type: 'reunion', date: '2025-07-16', time: '09:00' },
  { id: 4, title: 'Follow-up Global', type: 'tarea', date: '2025-07-17', time: '11:00' },
]

const typeColors = { demo: '#16A34A', llamada: '#7C3AED', reunion: '#2563EB', tarea: '#D97706' }

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const monthDays = Array.from({ length: 35 }, (_, i) => {
  const day = i - 3
  const date = new Date(2025, 6, day + 1)
  return { day: date.getDate(), date: date.toISOString().split('T')[0], isCurrentMonth: day >= 0 && day < 31 }
})

export default function Calendar() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <div className={styles.nav}>
          <button><ChevronLeft size={20} /></button>
          <h1>Julio 2025</h1>
          <button><ChevronRight size={20} /></button>
          <button className={styles.todayBtn}>Hoy</button>
        </div>
        <div className={styles.viewToggle}>
          {(['month', 'week', 'day'] as const).map(v => (
            <button key={v} className={`${styles.viewBtn} ${view === v ? styles.active : ''}`} onClick={() => setView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <button className={styles.newBtn}>+ Nuevo evento</button>
      </div>

      {view === 'month' && (
        <div className={styles.monthView}>
          <div className={styles.weekDays}>
            {days.map(d => <div key={d} className={styles.weekDay}>{d}</div>)}
          </div>
          <div className={styles.daysGrid}>
            {monthDays.map((d, i) => {
              const dayEvents = events.filter(e => e.date === d.date)
              return (
                <div key={i} className={`${styles.dayCell} ${!d.isCurrentMonth ? styles.otherMonth : ''} ${d.date === '2025-07-15' ? styles.today : ''}`}>
                  <span className={styles.dayNumber}>{d.day}</span>
                  <div className={styles.eventsList}>
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className={styles.eventPill} style={{ background: typeColors[e.type as keyof typeof typeColors] }}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <span className={styles.moreEvents}>+{dayEvents.length - 2}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}