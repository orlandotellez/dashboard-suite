import React, { useState } from 'react'
import { useVentasStore } from '../store/useVentasStore'
import { Medicine, Cliente } from '../types/pharmacy'

interface VentaFormProps {
  cart: { medicamentoId: string; cantidad: number; precioUnitario: number; subtotal: number }[]
  clientes: Cliente[]
  medicines: Medicine[]
  onAddToCart: (medicamentoId: string, cantidad: number) => void
  onRemoveFromCart: (medicamentoId: string) => void
  onConfirmVenta: (clienteId: string, metodoPago: 'efectivo' | 'tarjeta' | 'transferencia') => void
  onClearCart: () => void
}

export const VentaForm: React.FC<VentaFormProps> = ({ 
  cart, 
  clientes, 
  medicines,
  onAddToCart, 
  onRemoveFromCart, 
  onConfirmVenta,
  onClearCart
}) => {
  const [selectedMedId, setSelectedMedId] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [selectedClienteId, setSelectedClienteId] = useState('')
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo')
  
  const { getCartTotal } = useVentasStore()
  const totals = getCartTotal()
  
  const handleAddToCart = () => {
    if (!selectedMedId) return
    onAddToCart(selectedMedId, cantidad)
    setSelectedMedId('')
    setCantidad(1)
  }
  
  const handleConfirm = () => {
    if (!selectedClienteId) {
      alert('Seleccione un cliente')
      return
    }
    onConfirmVenta(selectedClienteId, metodoPago)
  }
  
  const getMedicineName = (id: string) => {
    const med = medicines.find(m => m.id === id)
    return med ? med.name : 'Desconocido'
  }
  
  return (
    <div className="venta-form">
      <div className="venta-section">
        <h3>Seleccionar Medicamento</h3>
        <div className="form-row">
          <select 
            value={selectedMedId}
            onChange={(e) => setSelectedMedId(e.target.value)}
            className="form-select"
          >
            <option value="">Seleccionar medicamento...</option>
            {medicines
              .filter(m => m.stock > 0)
              .map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} - Stock: {m.stock} - ${m.price.toFixed(2)}
                </option>
              ))}
          </select>
          <input 
            type="number" 
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            min="1"
            className="form-input-small"
          />
          <button 
            type="button" 
            className="btn-primary"
            onClick={handleAddToCart}
            disabled={!selectedMedId}
          >
            Agregar
          </button>
        </div>
      </div>
      
      {cart.length > 0 && (
        <div className="venta-section">
          <h3>Carrito de Venta</h3>
          <table className="data-table compact">
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx}>
                  <td>{getMedicineName(item.medicamentoId)}</td>
                  <td>{item.cantidad}</td>
                  <td>${item.precioUnitario.toFixed(2)}</td>
                  <td>${item.subtotal.toFixed(2)}</td>
                  <td>
                    <button 
                      className="btn-icon btn-danger"
                      onClick={() => onRemoveFromCart(item.medicamentoId)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="cart-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>IVA (21%):</span>
              <span>${totals.impuestos.toFixed(2)}</span>
            </div>
            <div className="total-row total">
              <span>Total:</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="venta-section">
        <h3>Datos de la Venta</h3>
        <div className="form-group">
          <label>Cliente</label>
          <select 
            value={selectedClienteId}
            onChange={(e) => setSelectedClienteId(e.target.value)}
            required
          >
            <option value="">Seleccionar cliente...</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} - DNI: {c.dni}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Método de Pago</label>
          <div className="radio-group">
            <label className="radio-label">
              <input 
                type="radio" 
                name="metodoPago" 
                value="efectivo"
                checked={metodoPago === 'efectivo'}
                onChange={() => setMetodoPago('efectivo')}
              />
              Efectivo
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="metodoPago" 
                value="tarjeta"
                checked={metodoPago === 'tarjeta'}
                onChange={() => setMetodoPago('tarjeta')}
              />
              Tarjeta
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="metodoPago" 
                value="transferencia"
                checked={metodoPago === 'transferencia'}
                onChange={() => setMetodoPago('transferencia')}
              />
              Transferencia
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onClearCart}
            disabled={cart.length === 0}
          >
            Limpiar Carrito
          </button>
          <button 
            type="button" 
            className="btn-primary"
            onClick={handleConfirm}
            disabled={cart.length === 0 || !selectedClienteId}
          >
            Confirmar Venta
          </button>
        </div>
      </div>
    </div>
  )
}
