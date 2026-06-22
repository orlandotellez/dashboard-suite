import React, { useState } from 'react'
import { useReportesStore } from '../store/useReportesStore'
import { ReporteChart } from '../components/ReporteChart'

export const ReportesPage: React.FC = () => {
  const { ventas, getVentasByDateRange } = useReportesStore()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredVentas, setFilteredVentas] = useState(ventas)
  
  const handleFilter = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // Incluir todo el día final
      setFilteredVentas(getVentasByDateRange(start, end))
    } else {
      setFilteredVentas(ventas)
    }
  }
  
  const clearFilter = () => {
    setStartDate('')
    setEndDate('')
    setFilteredVentas(ventas)
  }
  
  const totalPeriodo = filteredVentas.reduce((acc, v) => acc + v.total, 0)
  const totalVentas = filteredVentas.length

  return (
    <div>
      <div className="content-header">
        <h1>Reportes y Estadísticas</h1>
        <p>Visualice tendencias de ventas e inventario</p>
      </div>
      
      {/* Gráficos */}
      <div className="content-section">
        <ReporteChart />
      </div>
      
      {/* Filtros por Fecha */}
      <div className="content-section">
        <h2>Filtrar Ventas por Fecha</h2>
        <div className="filter-row">
          <div className="form-group inline">
            <label>Desde:</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group inline">
            <label>Hasta:</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={handleFilter}>Filtrar</button>
          <button className="btn-secondary" onClick={clearFilter}>Limpiar</button>
        </div>
        
        <div className="stats-row">
          <div className="stat-mini">
            <span className="stat-label">Total Ventas</span>
            <span className="stat-value">{totalVentas}</span>
          </div>
          <div className="stat-mini">
            <span className="stat-label">Monto Total</span>
            <span className="stat-value">${totalPeriodo.toFixed(2)}</span>
          </div>
        </div>
        
        {filteredVentas.length === 0 ? (
          <div className="empty-state">No hay ventas en este período</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente ID</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Método</th>
                </tr>
              </thead>
              <tbody>
                {filteredVentas.map(venta => (
                  <tr key={venta.id}>
                    <td>
                      {new Date(venta.fecha).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </td>
                    <td>{venta.clienteId}</td>
                    <td>{venta.items.length} productos</td>
                    <td>${venta.total.toFixed(2)}</td>
                    <td>
                      <span className="badge">
                        {venta.metodoPago === 'efectivo' ? 'Efectivo' : 
                         venta.metodoPago === 'tarjeta' ? 'Tarjeta' : 'Transferencia'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
