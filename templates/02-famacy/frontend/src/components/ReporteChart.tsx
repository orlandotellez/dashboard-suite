import React, { useState, useMemo } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts'
import { useReportesStore } from '../store/useReportesStore'

export const ReporteChart: React.FC = () => {
  const { getVentasDiarias, getVentasByMedicamento } = useReportesStore()
  const [dias, setDias] = useState(7)
  const [view, setView] = useState<'diario' | 'medicamento'>('diario')
  
  const ventasDiariasData = useMemo(() => getVentasDiarias(dias), [dias])
  const ventasByMedData = useMemo(() => getVentasByMedicamento(), [])
  
  return (
    <div className="reportes-container">
      <div className="report-controls">
        <div className="view-toggle">
          <button 
            className={`tab ${view === 'diario' ? 'active' : ''}`}
            onClick={() => setView('diario')}
          >
            Ventas Diarias
          </button>
          <button 
            className={`tab ${view === 'medicamento' ? 'active' : ''}`}
            onClick={() => setView('medicamento')}
          >
            Por Medicamento
          </button>
        </div>
        
        {view === 'diario' && (
          <div className="form-group inline">
            <label>Últimos días:</label>
            <select value={dias} onChange={(e) => setDias(Number(e.target.value))}>
              <option value={7}>7 días</option>
              <option value={15}>15 días</option>
              <option value={30}>30 días</option>
            </select>
          </div>
        )}
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          {view === 'diario' ? (
            <BarChart data={ventasDiariasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fecha" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('es-AR')}
              />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Ventas" />
            </BarChart>
          ) : (
            <BarChart data={ventasByMedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="medicamento" type="category" width={150} />
              <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total']} />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total Vendido" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      
      {view === 'medicamento' && (
        <div className="content-section">
          <h3>Desglose por Medicamento</h3>
          <table className="data-table compact">
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Cantidad Vendida</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ventasByMedData.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.medicamento}</td>
                  <td>{item.cantidad}</td>
                  <td>${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
