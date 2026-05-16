import { Outlet } from 'react-router-dom'
import { SideBar } from './SideBar'
import { Header } from './Header'
import { useSideBarStore } from '@/store/useSideBarStore'
import styles from './DashboardLayout.module.css'

export const DashboardLayout = () => {
  const { collapsed } = useSideBarStore()

  return (
    <div className={styles.layout}>
      <SideBar />
      <div className={`${styles.main} ${collapsed ? styles.expanded : ""}`}>
        <Header />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
