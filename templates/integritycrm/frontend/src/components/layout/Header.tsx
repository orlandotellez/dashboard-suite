import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Plus, HelpCircle, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import styles from './Header.module.css'

export const Header = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <header className={styles.header}>
      {/* Right - Actions */}
      <div className={styles.right}>
        <button className={styles.iconButton} title="Notificaciones">
          <Bell />
          <span className={styles.badge}>3</span>
        </button>
        <button className={styles.iconButton} title="Ayuda">
          <HelpCircle />
        </button>
        <button className={styles.newButton}>
          <Plus />
          <span>Nuevo</span>
        </button>
        <div className={styles.userMenu} ref={dropdownRef}>
          <button
            className={styles.userButton}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className={styles.userAvatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <ChevronDown size={16} />
          </button>
          {showDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <span className={styles.userName}>{user?.name}</span>
                <span className={styles.userEmail}>{user?.email}</span>
              </div>
              <div className={styles.dropdownDivider} />
              <button className={styles.dropdownItem} onClick={() => navigate('/settings')}>
                <User size={16} />
                <span>Profile</span>
              </button>
              <button className={styles.dropdownItem} onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
