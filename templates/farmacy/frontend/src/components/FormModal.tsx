import React from 'react'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  title: string
  children: React.ReactNode
  submitText?: string
}

export const FormModal: React.FC<FormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  children,
  submitText = 'Guardar'
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit} className="modal-body">
          {children}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
