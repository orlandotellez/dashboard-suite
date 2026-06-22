import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className={styles.content}>
        <h1>404</h1>
        <p>Página no encontrada</p>
        <Link to="/" className={styles.homeBtn}><Home size={16} />Volver al Dashboard</Link>
      </div>
    </div>
  )
}