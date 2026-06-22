import { Plus, Mail, Phone, Edit, Trash2 } from 'lucide-react'
import styles from './Team.module.css'

const team = [
  { id: 1, name: 'Ana García', email: 'ana@agenciapro.com', role: 'ADMIN', deals: 12, tasks: 34, activity: 98, avatar: 'AG', color: '#2563EB' },
  { id: 2, name: 'Roberto Smith', email: 'roberto@agenciapro.com', role: 'MANAGER', deals: 10, tasks: 28, activity: 95, avatar: 'RS', color: '#7C3AED' },
  { id: 3, name: 'María López', email: 'maria@agenciapro.com', role: 'VENDEDOR', deals: 8, tasks: 22, activity: 88, avatar: 'ML', color: '#16A34A' },
  { id: 4, name: 'Carlos Ruiz', email: 'carlos@agenciapro.com', role: 'VENDEDOR', deals: 7, tasks: 19, activity: 82, avatar: 'CR', color: '#D97706' },
  { id: 5, name: 'Laura Díaz', email: 'laura@agenciapro.com', role: 'VENDEDOR', deals: 5, tasks: 15, activity: 75, avatar: 'LD', color: '#DC2626' },
  { id: 6, name: 'Pedro Martín', email: 'pedro@agenciapro.com', role: 'STAFF', deals: 3, tasks: 12, activity: 90, avatar: 'PM', color: '#6B7280' },
]

const roleColors = { ADMIN: '#2563EB', MANAGER: '#7C3AED', VENDEDOR: '#16A34A', STAFF: '#6B7280', SOLO_LECTURA: '#9CA3AF' }

export default function Team() {
  return (
    <div className={styles.team}>
      <div className={styles.header}>
        <div>
          <h1>Equipo</h1>
          <span className={styles.count}>{team.length} miembros</span>
        </div>
        <button className={styles.newBtn}><Plus size={16} />Invitar miembro</button>
      </div>

      <div className={styles.grid}>
        {team.map(member => (
          <div key={member.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar} style={{ background: member.color }}>{member.avatar}</div>
              <div className={styles.info}>
                <h3>{member.name}</h3>
                <span className={styles.role} style={{ background: `${roleColors[member.role as keyof typeof roleColors]}20`, color: roleColors[member.role as keyof typeof roleColors] }}>{member.role}</span>
              </div>
            </div>
            <p className={styles.email}>{member.email}</p>
            <div className={styles.stats}>
              <span>{member.deals} deals</span>
              <span>{member.tasks} tareas</span>
              <span>{member.activity}% actividad</span>
            </div>
            <div className={styles.status}><span className={styles.statusDot} />Activo</div>
            <div className={styles.actions}>
              <button><Mail size={14} /></button>
              <button><Edit size={14} /></button>
              <button><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}