import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Hexagon } from 'lucide-react'
import { navItems, getNavGroups } from '@/routes/NavItems'
import { useSideBarStore } from '@/store/useSideBarStore'
import styles from './SideBar.module.css'

export const SideBar = () => {
  const { collapsed, setCollapsed } = useSideBarStore()
  const navigate = useNavigate()
  const location = useLocation()

  const groups = getNavGroups()

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <Hexagon className={styles.iconLarge} />
        </div>
        {!collapsed && (
          <div className={styles.logoText}>
            <h1>IntegrityCRM</h1>
            <p>Agencia Pro</p>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      {groups.map((group) => (
        <div key={group.label} className={styles.navGroup}>
          {!collapsed && <span className={styles.groupLabel}>{group.label}</span>}
          <nav className={styles.nav}>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              const Icon = item.icon

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`${styles.navItem} ${isActive ? styles.active : ''} ${collapsed ? styles.isCollapsedIcon : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </div>
      ))}

      {/* Collapse Button */}
      <div className={styles.collapseContainer}>
        <button onClick={setCollapsed} className={styles.collapseButton}>
          {collapsed ? (
            <ChevronRight className={styles.icon} />
          ) : (
            <>
              <ChevronLeft className={styles.icon} />
              <span className={styles.collapseText}>Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}