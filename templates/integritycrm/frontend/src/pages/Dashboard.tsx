import { useMemo } from 'react'
import {
  Users,
  Target,
  DollarSign,
  Percent,
  CheckSquare,
  Mail,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRight,
  Trophy,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { useContactsStore } from '@/store/useContactsStore'
import { useDealsStore } from '@/store/useDealsStore'
import { useTasksStore } from '@/store/useTasksStore'
import { useAuthStore } from '@/store/useAuthStore'
import styles from './Dashboard.module.css'

// Mock sales data
const salesData = [
  { month: 'Ene', actual: 42000, target: 45000 },
  { month: 'Feb', actual: 38000, target: 45000 },
  { month: 'Mar', actual: 55000, target: 50000 },
  { month: 'Abr', actual: 47000, target: 50000 },
  { month: 'May', actual: 62000, target: 55000 },
  { month: 'Jun', actual: 58000, target: 55000 },
]

// Mock pipeline by stage
const pipelineData = [
  { stage: 'Prospecto', value: 545000, count: 6, color: '#6B7280' },
  { stage: 'Contactado', value: 605000, count: 5, color: '#2563EB' },
  { stage: 'Propuesta', value: 655000, count: 5, color: '#D97706' },
  { stage: 'Negociacion', value: 445000, count: 4, color: '#7C3AED' },
  { stage: 'Ganado', value: 710000, count: 5, color: '#16A34A' },
]

// Mock activities
const recentActivities = [
  { id: 1, type: 'contact_created', text: 'Nuevo contacto: TechCorp', time: '5 min', icon: 'user-plus', color: '#2563EB' },
  { id: 2, type: 'deal_updated', text: 'Oportunidad actualizada: Global', time: '1h', icon: 'refresh', color: '#7C3AED' },
  { id: 3, type: 'task_completed', text: 'Tarea completada: Demo Stellar', time: '2h', icon: 'check', color: '#16A34A' },
  { id: 4, type: 'email_sent', text: 'Correo enviado: Innova Digital', time: '3h', icon: 'mail', color: '#6B7280' },
  { id: 5, type: 'deal_won', text: 'Deal ganado: Nexus Industries', time: 'ayer', icon: 'trophy', color: '#16A34A' },
  { id: 6, type: 'contact_created', text: 'Nuevo contacto: CloudWorks', time: 'ayer', icon: 'user-plus', color: '#2563EB' },
  { id: 7, type: 'task_completed', text: 'Tarea completada: Follow-up', time: '2 días', icon: 'check', color: '#16A34A' },
  { id: 8, type: 'deal_updated', text: 'Oportunidad actualizada: DataPro', time: '2 días', icon: 'refresh', color: '#7C3AED' },
]

// Mock team performance
const teamPerformance = [
  { id: '1', name: 'Ana García', deals: 12, revenue: 245000, target: 250000, avatar: 'AG', color: '#2563EB' },
  { id: '2', name: 'Roberto Smith', deals: 10, revenue: 198000, target: 200000, avatar: 'RS', color: '#7C3AED' },
  { id: '3', name: 'María López', deals: 8, revenue: 156000, target: 180000, avatar: 'ML', color: '#D97706' },
  { id: '4', name: 'Carlos Ruiz', deals: 7, revenue: 142000, target: 150000, avatar: 'CR', color: '#16A34A' },
  { id: '5', name: 'Laura Díaz', deals: 5, revenue: 98000, target: 120000, avatar: 'LD', color: '#DC2626' },
]

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'user-plus': Activity,
  'refresh': Activity,
  'check': Activity,
  'mail': Activity,
  'trophy': Trophy,
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { contacts } = useContactsStore()
  const { deals } = useDealsStore()
  const { tasks } = useTasksStore()

  // Calculate KPIs
  const kpis = useMemo(() => {
    const activeContacts = contacts.filter(c => c).length
    const openDeals = deals.filter(d => d.stage !== 'GANADO' && d.stage !== 'PERDIDO')
    const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0)
    const wonDeals = deals.filter(d => d.stage === 'GANADO')
    const conversionRate = openDeals.length > 0
      ? Math.round((wonDeals.length / (wonDeals.length + openDeals.filter(d => d.stage === 'PERDIDO').length)) * 100)
      : 0

    const todayTasks = tasks.filter(t => {
      if (!t.dueDate) return false
      const today = new Date().toISOString().split('T')[0]
      return t.dueDate === today && t.status !== 'COMPLETADA'
    })

    return {
      activeClients: activeContacts,
      openOpportunities: openDeals.length,
      pipelineValue,
      conversionRate,
      pendingTasks: todayTasks.length,
      unreadEmails: 3, // mock
    }
  }, [contacts, deals, tasks])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className={styles.dashboard}>
      {/* Row 1 - KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total clientes activos</span>
            <Users className={styles.kpiIcon} style={{ color: '#2563EB' }} />
          </div>
          <div className={styles.kpiValue}>{kpis.activeClients}</div>
          <div className={styles.kpiFooter}>
            <span className={styles.kpiTrendPositive}>↑ 8%</span>
            <span className={styles.kpiCompare}>vs mes anterior</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Oportunidades abiertas</span>
            <Target className={styles.kpiIcon} style={{ color: '#7C3AED' }} />
          </div>
          <div className={styles.kpiValue}>{kpis.openOpportunities}</div>
          <div className={styles.kpiFooter}>
            <span className={styles.kpiTrendPositive}>↑ 12%</span>
            <span className={styles.kpiCompare}>vs mes anterior</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Valor del pipeline</span>
            <DollarSign className={styles.kpiIcon} style={{ color: '#16A34A' }} />
          </div>
          <div className={styles.kpiValue}>{formatCurrency(kpis.pipelineValue)}</div>
          <div className={styles.kpiFooter}>
            <span className={styles.kpiTrendPositive}>↑ 5%</span>
            <span className={styles.kpiCompare}>vs mes anterior</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Tasa de conversión</span>
            <Percent className={styles.kpiIcon} style={{ color: '#D97706' }} />
          </div>
          <div className={styles.kpiValue}>{kpis.conversionRate}%</div>
          <div className={styles.kpiFooter}>
            <span className={styles.kpiTrendNegative}>↓ 3%</span>
            <span className={styles.kpiCompare}>vs mes anterior</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Tareas pendientes hoy</span>
            <CheckSquare className={styles.kpiIcon} style={{ color: '#2563EB' }} />
          </div>
          <div className={styles.kpiValue}>{kpis.pendingTasks}</div>
          <div className={styles.kpiFooter}>
            <span className={styles.kpiTrendPositive}>↑ 2</span>
            <span className={styles.kpiCompare}>vs ayer</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Correos sin responder</span>
            <Mail className={styles.kpiIcon} style={{ color: '#DC2626' }} />
          </div>
          <div className={styles.kpiValue}>{kpis.unreadEmails}</div>
          <div className={styles.kpiFooter}>
            <span className={styles.kpiTrendNegative}>↑ 1</span>
            <span className={styles.kpiCompare}>vs ayer</span>
          </div>
        </div>
      </div>

      {/* Row 2 - Charts */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Rendimiento de ventas</h3>
            <div className={styles.periodSelector}>
              <button className={styles.periodBtn}>7D</button>
              <button className={`${styles.periodBtn} ${styles.active}`}>30D</button>
              <button className={styles.periodBtn}>90D</button>
            </div>
          </div>
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#9CA3AF"
                  strokeDasharray="5 5"
                  fill="transparent"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#colorActual)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartLegend}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#2563EB' }} />
              Oportunidades ganadas
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#9CA3AF' }} />
              Objetivo mensual
            </span>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Pipeline por etapa</h3>
          </div>
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pipelineData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="stage"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number, name: string, props: { payload: { count: number } }) =>
                    [formatCurrency(value) + ` · ${props.payload.count} deals`, '']
                  }
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 - Three Panels */}
      <div className={styles.panelsRow}>
        {/* Activity Feed */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Actividad reciente</h3>
          </div>
          <div className={styles.activityList}>
            {recentActivities.map((activity) => {
              const Icon = iconMap[activity.icon] || Activity
              return (
                <div key={activity.id} className={styles.activityItem}>
                  <div
                    className={styles.activityIcon}
                    style={{ background: `${activity.color}20`, color: activity.color }}
                  >
                    <Icon />
                  </div>
                  <span className={styles.activityText}>{activity.text}</span>
                  <span className={styles.activityTime}>{activity.time}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Tareas de hoy</h3>
            <a href="/tasks" className={styles.viewAllLink}>
              Ver todas <ArrowRight className={styles.arrowIcon} />
            </a>
          </div>
          <div className={styles.tasksList}>
            {tasks.slice(0, 6).map((task) => (
              <div key={task.id} className={styles.taskItem}>
                <button
                  className={`${styles.taskCheckbox} ${
                    task.status === 'COMPLETADA' ? styles.checked : ''
                  }`}
                >
                  {task.status === 'COMPLETADA' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <span className={`${styles.taskTitle} ${task.status === 'COMPLETADA' ? styles.completed : ''}`}>
                  {task.title}
                </span>
                <div className={styles.taskMeta}>
                  <span className={`${styles.priorityBadge} ${styles[task.priority.toLowerCase()]}`}>
                    {task.priority}
                  </span>
                  {task.dueTime && <span className={styles.taskTime}>{task.dueTime}</span>}
                </div>
              </div>
            ))}
            <button className={styles.addTaskBtn}>+ Nueva tarea</button>
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Mejores vendedores</h3>
            <div className={styles.periodSelector}>
              <button className={styles.periodBtn}>7D</button>
              <button className={`${styles.periodBtn} ${styles.active}`}>30D</button>
              <button className={styles.periodBtn}>90D</button>
            </div>
          </div>
          <div className={styles.leaderboard}>
            {teamPerformance.map((member, index) => {
              const progress = (member.revenue / member.target) * 100
              return (
                <div key={member.id} className={styles.leaderItem}>
                  <span className={`${styles.rank} ${index === 0 ? styles.gold : index === 1 ? styles.silver : index === 2 ? styles.bronze : ''}`}>
                    {index + 1}
                  </span>
                  <div
                    className={styles.avatar}
                    style={{ background: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <div className={styles.leaderInfo}>
                    <span className={styles.leaderName}>{member.name}</span>
                    <span className={styles.leaderStats}>
                      {member.deals} deals · {formatCurrency(member.revenue)}
                    </span>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}