import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import styles from './Reports.module.css'

const salesData = [
  { month: 'Ene', actual: 42, target: 45 },
  { month: 'Feb', actual: 38, target: 45 },
  { month: 'Mar', actual: 55, target: 50 },
  { month: 'Abr', actual: 47, target: 50 },
  { month: 'May', actual: 62, target: 55 },
  { month: 'Jun', actual: 58, target: 55 },
]

const sourceData = [
  { name: 'Referido', value: 35, color: '#2563EB' },
  { name: 'Web', value: 28, color: '#7C3AED' },
  { name: 'Eventos', value: 18, color: '#16A34A' },
  { name: 'LinkedIn', value: 12, color: '#D97706' },
  { name: 'Cold Call', value: 7, color: '#6B7280' },
]

const funnelData = [
  { stage: 'Prospecto', count: 45, rate: 100 },
  { stage: 'Contactado', count: 32, rate: 71 },
  { stage: 'Propuesta', count: 18, rate: 40 },
  { stage: 'Negociacion', count: 8, rate: 18 },
  { stage: 'Ganado', count: 5, rate: 11 },
]

export default function Reports() {
  return (
    <div className={styles.reports}>
      <div className={styles.header}>
        <h1>Reportes y Analíticas</h1>
      </div>

      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}><span className={styles.kpiLabel}>Deals ganados</span><span className={styles.kpiValue}>24</span></div>
        <div className={styles.kpiCard}><span className={styles.kpiLabel}>Valor total</span><span className={styles.kpiValue}>$1.2M</span></div>
        <div className={styles.kpiCard}><span className={styles.kpiLabel}>Tasa conversión</span><span className={styles.kpiValue}>24%</span></div>
        <div className={styles.kpiCard}><span className={styles.kpiLabel}>Tiempo cierre</span><span className={styles.kpiValue}>28 días</span></div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3>Ventas en el tiempo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="target" stroke="#9CA3AF" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="actual" stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3>Fuentes de leads</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                {sourceData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.funnelCard}>
        <h3>Rendimiento por etapa</h3>
        <div className={styles.funnel}>
          {funnelData.map((item, i) => (
            <div key={item.stage} className={styles.funnelStage}>
              <span>{item.stage}</span>
              <span>{item.count}</span>
              <div className={styles.funnelBar} style={{ width: `${item.rate}%`, background: ['#6B7280', '#2563EB', '#D97706', '#7C3AED', '#16A34A'][i] }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}