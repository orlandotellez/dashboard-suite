import React, { useState } from 'react'
import { useVentasStore } from '../store/useVentasStore'
import { VentaForm } from '../components/VentaForm'
import { VentasTable } from '../components/VentasTable'

export const VentasPage: React.FC = () => {
  const { 
    ventas, 
    cart, 
    clientes, 
    medicines,
    addToCart, 
    removeFromCart, 
    clearCart, 
    confirmVenta
  } = useVentasStore()
  
  const [activeTab, setActiveTab] = useState<'nueva' | 'historial'>('nueva')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const handleAddToCart = (medicamentoId: string, cantidad: number) => {
    const result = addToCart(medicamentoId, cantidad)
    if (!result.success) {
      setMessage({ type: 'error', text: result.error || 'Error al agregar' })
      setTimeout(() => setMessage(null), 3000)
    }
  }
  
  const handleConfirmVenta = async (clienteId: string, metodoPago: 'efectivo' | 'tarjeta' | 'transferencia') => {
    const result = await confirmVenta(clienteId, metodoPago)
    if (result) {
      setMessage({ type: 'success', text: 'Venta registrada exitosamente' })
      setActiveTab('historial')
    } else {
      setMessage({ type: 'error', text: 'Error al procesar la venta' })
    }
    setTimeout(() => setMessage(null), 3000)
  }
  
  return (
    <div>
      <div className="content-header">
        <h1>Registro de Ventas</h1>
        <p>Registre nuevas ventas y consulte el historial</p>
      </div>
      
      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'nueva' ? 'active' : ''}`}
          onClick={() => setActiveTab('nueva')}
        >
          Nueva Venta
        </button>
        <button 
          className={`tab ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          Historial de Ventas
        </button>
      </div>
      
      <div className="content-section">
        {activeTab === 'nueva' ? (
          <VentaForm 
            cart={cart}
            clientes={clientes}
            medicines={medicines}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={removeFromCart}
            onConfirmVenta={handleConfirmVenta}
            onClearCart={clearCart}
          />
        ) : (
          <VentasTable 
            ventas={ventas}
            clientes={clientes}
            medicines={medicines}
          />
        )}
      </div>
    </div>
  )
}
