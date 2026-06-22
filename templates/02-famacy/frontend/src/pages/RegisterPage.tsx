import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Lock, Mail, User, UserPlus } from 'lucide-react'
import { Role } from '../types/auth'

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<Role>('staff')
  const [error, setError] = useState('')
  const register = useAuthStore(state => state.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor complete todos los campos')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    const success = await register(name, email, password, role)
    if (success) {
      navigate('/')
    } else {
      setError('No se pudo completar el registro. El email podría estar en uso.')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <UserPlus size={32} color="var(--color-primary)" />
          <h1>Crear Cuenta</h1>
          <p>Registrate en Farmacia Stock</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">
              <User size={18} />
              <span>Nombre completo</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              <span>Email</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@farmacia.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              <span>Contraseña</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <Lock size={18} />
              <span>Confirmar contraseña</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">
              <User size={18} />
              <span>Tipo de cuenta</span>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="form-select"
            >
              <option value="staff">Staff (Cajero/Vendedor)</option>
              <option value="admin">Admin (Administrador)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary auth-submit">
            Crear cuenta
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  )
}