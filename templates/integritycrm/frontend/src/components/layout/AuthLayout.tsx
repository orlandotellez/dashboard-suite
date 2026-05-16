import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import styles from './AuthLayout.module.css'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className={styles.authLayout}>
      <div className={styles.authCard}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Shield size={24} />
          </div>
          <span className={styles.logoText}>IntegrityCRM</span>
        </div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}

export const AuthFooter = ({
  text,
  linkText,
  to,
}: {
  text: string
  linkText: string
  to: string
}) => {
  return (
    <p className={styles.footer}>
      {text} <Link to={to}>{linkText}</Link>
    </p>
  )
}