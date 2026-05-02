import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { User, Lock, Mail } from 'lucide-react'

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  if (!isAuthenticated || !user) {
    return <div className="error-container">No autorizado</div>
  }

  const handleUpdateProfile = async () => {
    // TODO: Connect to backend profile update endpoint when available
    setMessage({ type: 'error', text: 'Actualización de perfil no implementada en el backend aún' })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <User size={48} color="var(--color-primary)" />
          <h1>Mi Perfil</h1>
          <p>Gestiná tu información personal</p>
        </div>

        <div className="profile-info">
          <div className="profile-field">
            <Mail size={18} />
            <div>
              <label>Email</label>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="profile-field">
            <User size={18} />
            <div>
              <label>Nombre</label>
              <p>{user.name}</p>
            </div>
          </div>

          <div className="profile-field">
            <Lock size={18} />
            <div>
              <label>Rol</label>
              <p>{user.role}</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-actions">
          <h3>Actualizar Perfil</h3>
          <div className="form-group">
            <label>Nuevo nombre</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={user.name}
            />
          </div>

          <div className="form-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Dejar en blanco para no cambiar"
            />
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleUpdateProfile}
            disabled={!newName && !newPassword}
          >
            Actualizar Perfil
          </button>
        </div>
      </div>
    </div>
  )
}
