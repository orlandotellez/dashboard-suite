# Componentes Globales - Ejemplos

## src/components/global/dashboard/MetricCard.tsx

```typescript
import { LucideIcon } from 'lucide-react';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  variant?: 'default' | 'metric' | 'warning' | 'success' | 'destructive';
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  variant = 'metric',
}: MetricCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.content}>
        <div className={styles.info}>
          <p className={styles.title}>{title}</p>
          <p className={styles.value}>{value}</p>
          {change && (
            <p
              className={`${styles.change} ${
                changeType === 'positive'
                  ? styles.positive
                  : changeType === 'negative'
                  ? styles.negative
                  : styles.neutral
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className={styles.iconBox}>
          <Icon className={styles.icon} />
        </div>
      </div>
    </div>
  );
}
```

---

## src/components/global/dashboard/MetricCard.module.css

```css
.card {
  background-color: white;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 20px;
}

.content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.info {
  flex: 1;
}

.title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 8px 0;
}

.value {
  font-family: var(--font-mono);
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.change {
  font-size: 12px;
  margin-top: 8px;
}

.change.positive {
  color: var(--success);
}

.change.negative {
  color: var(--danger);
}

.change.neutral {
  color: var(--text-tertiary);
}

.iconBox {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.icon {
  width: 24px;
  height: 24px;
  color: var(--text-secondary);
}

.card.warning .iconBox {
  background-color: var(--warning-bg);
}

.card.warning .icon {
  color: var(--warning);
}

.card.success .iconBox {
  background-color: var(--success-bg);
}

.card.success .icon {
  color: var(--success);
}

.card.destructive .iconBox {
  background-color: var(--danger-bg);
}

.card.destructive .icon {
  color: var(--danger);
}
```

---

## src/components/global/dashboard/SalesChart.tsx

```typescript
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import styles from './SalesChart.module.css';

interface SalesChartProps {
  data: Array<{
    month: string;
    won: number;
    target: number;
  }>;
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.title}>Rendimiento de ventas</h3>
        <div className={styles.periodSelector}>
          <button className={styles.periodButton}>7D</button>
          <button className={`${styles.periodButton} ${styles.active}`}>30D</button>
          <button className={styles.periodButton}>90D</button>
        </div>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="won"
              stroke="#2563EB"
              strokeWidth={2}
              fill="url(#colorWon)"
              name="Oportunidades ganadas"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
              name="Objetivo mensual"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

---

## src/components/global/dashboard/PipelineChart.tsx

```typescript
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import styles from './PipelineChart.module.css';

interface PipelineChartProps {
  data: Array<{
    stage: string;
    value: number;
    count: number;
    color: string;
  }>;
}

export function PipelineChart({ data }: PipelineChartProps) {
  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.title}>Pipeline por etapa</h3>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <YAxis
              type="category"
              dataKey="stage"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 13 }}
              width={80}
            />
            <Tooltip
              cursor={{ fill: '#F3F4F6' }}
              formatter={(value: number, name: string) => [
                name === 'value' ? `$${value.toLocaleString()}` : value,
                name === 'value' ? 'Valor' : 'Deals',
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={8}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

---

## src/components/global/dashboard/ActivityFeed.tsx

```typescript
import {
  UserPlus,
  Refresh,
  CheckCircle,
  Mail,
  Trophy,
} from 'lucide-react';
import styles from './ActivityFeed.module.css';

interface Activity {
  id: string;
  type: 'contact_created' | 'deal_updated' | 'task_completed' | 'email_sent' | 'deal_won';
  description: string;
  time: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const iconMap = {
  contact_created: { icon: UserPlus, color: '#2563EB' },
  deal_updated: { icon: Refresh, color: '#7C3AED' },
  task_completed: { icon: CheckCircle, color: '#16A34A' },
  email_sent: { icon: Mail, color: '#6B7280' },
  deal_won: { icon: Trophy, color: '#16A34A' },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className={styles.feed}>
      <h3 className={styles.title}>Actividad reciente</h3>
      <div className={styles.list}>
        {activities.map((activity) => {
          const { icon: Icon, color } = iconMap[activity.type];
          return (
            <div key={activity.id} className={styles.item}>
              <div className={styles.icon} style={{ backgroundColor: `${color}20`, color }}>
                <Icon size={14} />
              </div>
              <div className={styles.content}>
                <p className={styles.description}>{activity.description}</p>
                <span className={styles.time}>{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## src/components/global/dashboard/TaskList.tsx

```typescript
import { Check } from 'lucide-react';
import styles from './TaskList.module.css';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'alta' | 'media' | 'baja';
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
}

export function TaskList({ tasks, onToggle }: TaskListProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Tareas de hoy</h3>
      <div className={styles.list}>
        {tasks.map((task) => (
          <div key={task.id} className={styles.item}>
            <button
              className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
              onClick={() => onToggle(task.id)}
            >
              {task.completed && <Check size={12} />}
            </button>
            <span className={`${styles.title} ${task.completed ? styles.completed : ''}`}>
              {task.title}
            </span>
            <span className={`${styles.priority} ${styles[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## src/components/global/dashboard/Leaderboard.tsx

```typescript
import styles from './Leaderboard.module.css';

interface Member {
  rank: number;
  name: string;
  avatar?: string;
  deals: number;
  revenue: number;
  progress: number;
}

interface LeaderboardProps {
  members: Member[];
}

export function Leaderboard({ members }: LeaderboardProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Mejores vendedores</h3>
      <div className={styles.list}>
        {members.map((member) => (
          <div key={member.rank} className={styles.item}>
            <span
              className={`${styles.rank} ${
                member.rank === 1 ? styles.gold : member.rank === 2 ? styles.silver : member.rank === 3 ? styles.bronze : ''
              }`}
            >
              {member.rank}
            </span>
            <div className={styles.avatar}>
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} />
              ) : (
                <span>{member.name.charAt(0)}</span>
              )}
            </div>
            <div className={styles.info}>
              <span className={styles.name}>{member.name}</span>
              <div className={styles.stats}>
                <span>{member.deals} deals</span>
                <span>${member.revenue.toLocaleString()}</span>
              </div>
            </div>
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${member.progress}%` }} />
              </div>
              <span className={styles.progressText}>{member.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```