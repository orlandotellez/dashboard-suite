import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  colorClass: string
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <h3>{title}</h3>
        <div className="value">{value}</div>
      </div>
      <div className={`stat-icon ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  )
}
