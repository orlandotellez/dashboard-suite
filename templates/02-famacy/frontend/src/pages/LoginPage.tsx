import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Lock, Mail } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const login = useAuthStore(state => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor complete todos los campos')
      return
    }

    const success = await login(email, password)
    if (success) {
      navigate('/')
    } else {
      setError('Usuario no encontrado o contraseña incorrecta')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Lock size={32} color="var(--color-primary)" />
          <h1>Iniciar Sesión</h1>
          <p>Accedé al sistema de Farmacia Stock</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

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
              placeholder="admin@farmacia.com"
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
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit">
            Ingresar
          </button>
        </form>

        <div className="auth-demo-credentials">
          <h4>Credenciales de prueba:</h4>
          <ul>
            <li><strong>Admin:</strong> admin@farmacia.com / admin123</li>
            <li><strong>Staff:</strong> staff@farmacia.com / staff123</li>
            <li><strong>Customer:</strong> cust@farmacia.com / cust123</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
