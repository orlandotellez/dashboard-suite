import { Plus, FileText, Download, Send, Edit, Trash2, Eye } from 'lucide-react'
import styles from './Documents.module.css'

const docs = [
  { id: 1, name: 'Propuesta TechCorp', type: 'PROPUESTA', client: 'TechCorp Solutions', status: 'ENVIADO', value: 85000, created: '2025-07-10' },
  { id: 2, name: 'Contrato Global', type: 'CONTRATO', client: 'Global Ventures', status: 'FIRMADO', value: 220000, created: '2025-07-05' },
  { id: 3, name: 'Cotización Innova', type: 'COTIZACION', client: 'Innova Digital', status: 'VISTO', value: 45000, created: '2025-07-08' },
  { id: 4, name: 'Propuesta Stellar', type: 'PROPUESTA', client: 'Stellar Systems', status: 'BORRADOR', value: 130000, created: '2025-07-12' },
  { id: 5, name: 'Contrato DataPro', type: 'CONTRATO', client: 'DataPro Inc', status: 'RECHAZADO', value: 175000, created: '2025-07-01' },
]

const typeColors = { PROPUESTA: '#2563EB', CONTRATO: '#7C3AED', COTIZACION: '#D97706', OTRO: '#6B7280' }
const statusColors = { BORRADOR: '#6B7280', ENVIADO: '#2563EB', VISTO: '#D97706', FIRMADO: '#16A34A', RECHAZADO: '#DC2626' }

export default function Documents() {
  return (
    <div className={styles.documents}>
      <div className={styles.header}>
        <h1>Documentos y Propuestas</h1>
        <button className={styles.newBtn}><Plus size={16} />Nuevo documento</button>
      </div>

      <div className={styles.tableView}>
        <table className={styles.table}>
          <thead>
            <tr><th>Nombre</th><th>Tipo</th><th>Cliente</th><th>Estado</th><th>Valor</th><th>Creado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id}>
                <td><div className={styles.nameCell}><FileText size={16} /><span>{d.name}</span></div></td>
                <td><span className={styles.typeBadge} style={{ background: `${typeColors[d.type as keyof typeof typeColors]}20`, color: typeColors[d.type as keyof typeof typeColors] }}>{d.type}</span></td>
                <td>{d.client}</td>
                <td><span className={styles.statusBadge} style={{ background: `${statusColors[d.status as keyof typeof statusColors]}20`, color: statusColors[d.status as keyof typeof statusColors] }}>{d.status}</span></td>
                <td className={styles.value}>${d.value.toLocaleString()}</td>
                <td>{d.created}</td>
                <td>
                  <div className={styles.actions}>
                    <button title="Ver"><Eye size={14} /></button>
                    <button title="Editar"><Edit size={14} /></button>
                    <button title="Enviar"><Send size={14} /></button>
                    <button title="Descargar"><Download size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}