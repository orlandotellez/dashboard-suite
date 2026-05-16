import { useState } from 'react'
import { Plus, Zap, Play, Edit, Trash2 } from 'lucide-react'
import styles from './Automations.module.css'

const automations = [
  { id: 1, name: 'Bienvenida a nuevos leads', trigger: 'Nuevo contacto creado', action: 'Enviar email de bienvenida', active: true, executions: 124, lastRun: 'hace 2h' },
  { id: 2, name: 'Seguimiento post-reunión', trigger: 'Reunión completada', action: 'Crear tarea de seguimiento', active: true, executions: 45, lastRun: 'ayer' },
  { id: 3, name: 'Alerta de deal estancado', trigger: 'Sin actividad >7 días', action: 'Notificar responsable', active: true, executions: 18, lastRun: 'hace 3 días' },
  { id: 4, name: 'Asignación automática', trigger: 'Nuevo lead de web', action: 'Asignar al vendedor con menos deals', active: false, executions: 0, lastRun: 'nunca' },
  { id: 5, name: 'Recordatorio de propuesta', trigger: 'Propuesta enviada hace 3 días', action: 'Enviar follow-up', active: true, executions: 32, lastRun: 'hace 1 día' },
  { id: 6, name: 'Deal ganado onboarding', trigger: 'Deal marcado como ganado', action: 'Crear checklist de onboarding', active: true, executions: 12, lastRun: 'hace 5 días' },
]

export default function Automations() {
  const [activeAutomations, setActiveAutomations] = useState(automations.map(a => a.id))

  const toggleActive = (id: number) => {
    setActiveAutomations(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className={styles.automations}>
      <div className={styles.header}>
        <div>
          <h1>Automatizaciones</h1>
          <p className={styles.subtitle}>Configura flujos de trabajo automáticos</p>
        </div>
        <button className={styles.newBtn}><Plus size={16} />Nueva automatización</button>
      </div>

      <div className={styles.grid}>
        {automations.map(auto => (
          <div key={auto.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}><Zap size={18} /></div>
              <div className={styles.cardTitle}>
                <span>{auto.name}</span>
                <button
                  className={`${styles.toggle} ${activeAutomations.includes(auto.id) ? styles.active : ''}`}
                  onClick={() => toggleActive(auto.id)}
                >
                  <span className={styles.toggleSlider} />
                </button>
              </div>
            </div>
            <div className={styles.cardBody}>
              <p><strong>Cuando:</strong> {auto.trigger}</p>
              <p><strong>Entonces:</strong> {auto.action}</p>
            </div>
            <div className={styles.cardFooter}>
              <span>Ejecutada {auto.executions} veces · Última: {auto.lastRun}</span>
              <div className={styles.cardActions}>
                <button><Play size={14} /></button>
                <button><Edit size={14} /></button>
                <button><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}