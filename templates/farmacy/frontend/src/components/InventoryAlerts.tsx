import React from 'react'
import { usePharmacyStore } from '../store/usePharmacyStore'
import { AlertTriangle } from 'lucide-react'

export const InventoryAlerts: React.FC = () => {
  const { stats } = usePharmacyStore()

  return (
    <div className="content-section">
      <div className="section-header">
        <h2>Alertas de Inventario</h2>
        <span style={{ color: 'var(--color-warning)', fontWeight: 600, fontSize: '0.875rem' }}>
          {stats.lowStock.length} productos críticos
        </span>
      </div>
      {stats.lowStock.length > 0 ? (
        stats.lowStock.map((med) => (
          <div key={med.id} className="alert-item">
            <AlertTriangle size={20} color="var(--color-warning)" />
            <p>
              <strong>{med.name}</strong> tiene stock bajo: solo quedan {med.stock} unidades.
            </p>
            <span className="alert-time">Hace 2 horas</span>
          </div>
        ))
      ) : (
        <p style={{ color: 'var(--color-text-secondary)' }}>No hay alertas de inventario por el momento.</p>
      )}
    </div>
  )
}
