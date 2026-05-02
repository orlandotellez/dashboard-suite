import React, { useState } from 'react'
import { useClientesStore } from '../store/useClientesStore'
import { ClienteForm } from '../components/ClienteForm'
import { ClientesTable } from '../components/ClientesTable'
import { FormModal } from '../components/FormModal'
import { SearchInput } from '../components/SearchInput'
import { Cliente } from '../types/pharmacy'

export const ClientesPage: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    addCliente, 
    updateCliente, 
    deleteCliente,
    getFilteredClientes 
  } = useClientesStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const filteredClientes = getFilteredClientes()
  
  const handleAdd = () => {
    setEditingCliente(undefined)
    setIsModalOpen(true)
  }
  
  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setIsModalOpen(true)
  }
  
  const handleDelete = (cliente: Cliente) => {
    if (window.confirm(`¿Está seguro de eliminar al cliente ${cliente.nombre}?`)) {
      deleteCliente(cliente.id)
      setMessage({ type: 'success', text: 'Cliente eliminado exitosamente' })
      setTimeout(() => setMessage(null), 3000)
    }
  }
  
  const handleSubmit = async (data: Omit<Cliente, 'id'>) => {
    if (editingCliente) {
      updateCliente(editingCliente.id, data)
      setMessage({ type: 'success', text: 'Cliente actualizado exitosamente' })
    } else {
      const result = await addCliente(data)
      if (result.success) {
        setMessage({ type: 'success', text: 'Cliente registrado exitosamente' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al registrar cliente' })
        return
      }
    }
    setIsModalOpen(false)
    setTimeout(() => setMessage(null), 3000)
  }
  
  return (
    <div>
      <div className="content-header">
        <h1>Gestión de Clientes</h1>
        <p>Administre la base de datos de clientes</p>
      </div>
      
      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="section-controls">
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre o DNI..."
        />
        <button className="btn-primary" onClick={handleAdd}>
          + Nuevo Cliente
        </button>
      </div>
      
      <div className="content-section">
        <ClientesTable 
          clientes={filteredClientes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      
      <FormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(e) => { e.preventDefault() }}
        title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <ClienteForm 
          initialData={editingCliente}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </FormModal>
    </div>
  )
}
