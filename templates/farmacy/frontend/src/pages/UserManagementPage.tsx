import React from 'react'
import { User, AlertCircle } from 'lucide-react'

export const UserManagementPage: React.FC = () => {
  return (
    <div className="user-management">
      <div className="page-header">
        <h1>
          <User size={24} />
          Gestión de Usuarios
        </h1>
      </div>

      <div className="alert alert-info">
        <AlertCircle size={18} />
        <div>
          <h3>Funcionalidad no disponible</h3>
          <p>
            El backend actual no tiene endpoints para gestión de usuarios. 
            Solo están disponibles las rutas de autenticación (login/register).
          </p>
          <p className="mt-2">
            Para crear nuevos usuarios, utilizá el flujo de registro normal en <a href="/register">/register</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
