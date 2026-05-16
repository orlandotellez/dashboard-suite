# Charts - Gráficos con Recharts

## Visión General

Implementación de todos los charts del CRM usando Recharts.

---

## Configuración Global

```javascript
// Theme base para todos los charts
const chartTheme = {
  colors: {
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    secondary: '#6B7280',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    purple: '#7C3AED',
    gray: '#9CA3AF',
    grid: '#E5E7EB',
  },
  fonts: {
    family: 'Inter, sans-serif',
    mono: 'Inter, monospace',
  },
  axis: {
    textColor: '#6B7280',
    tickColor: '#D1D5DB',
  },
};

// Default props
const defaultChartProps = {
  responsive: true,
  maintainAspectRatio: false,
  animationDuration: 800,
  animationEasing: 'ease-out',
};
```

---

## Dashboard Charts

### Area Chart - Rendimiento de Ventas

```jsx
<AreaChart
  data={salesData}
  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
>
  <defs>
    <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
    </linearGradient>
  </defs>
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
    tickFormatter={(value) => `$${value / 1000}K`}
  />
  <Tooltip
    contentStyle={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    }}
    formatter={(value) => [`$${value.toLocaleString()}`, null]}
  />
  <Area
    type="monotone"
    dataKey="won"
    stroke="#2563EB"
    strokeWidth={2}
    fill="url(#colorWon)"
    name="Oportunidades ganadas"
  />
  <Line
    type="monotone"
    dataKey="target"
    stroke="#9CA3AF"
    strokeWidth={2}
    strokeDasharray="5 5"
    dot={false}
    name="Objetivo mensual"
  />
</AreaChart>
```

### Bar Chart - Pipeline por Etapa

```jsx
<BarChart
  data={pipelineByStage}
  layout="vertical"
  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
>
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
    formatter={(value, name) => [
      name === 'value' ? `$${value.toLocaleString()}` : value,
      name === 'value' ? 'Valor' : 'Deals'
    ]}
  />
  <Bar
    dataKey="value"
    radius={[0, 4, 4, 0]}
    barSize={8}
  >
    {pipelineByStage.map((entry, index) => (
      <Cell key={index} fill={entry.color} />
    ))}
  </Bar>
</BarChart>
```

---

## Reportes Charts

### Line Chart - Ventas en el Tiempo

```jsx
<LineChart
  data={salesOverTime}
  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
>
  <XAxis dataKey="date" />
  <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
  <Legend />
  <Line
    type="monotone"
    dataKey="closed"
    stroke="#2563EB"
    strokeWidth={2}
    dot={false}
    name="Deals cerrados"
  />
  <Line
    type="monotone"
    dataKey="target"
    stroke="#9CA3AF"
    strokeWidth={2}
    strokeDasharray="5 5"
    dot={false}
    name="Objetivo"
  />
</LineChart>
```

### Pie Chart - Fuentes de Leads

```jsx
<PieChart>
  <Pie
    data={leadSources}
    cx="50%"
    cy="50%"
    innerRadius={60}
    outerRadius={80}
    paddingAngle={2}
    dataKey="value"
    nameKey="source"
  >
    {leadSources.map((entry, index) => (
      <Cell key={index} fill={entry.color} />
    ))}
  </Pie>
  <Tooltip />
  <Legend
    verticalAlign="bottom"
    height={36}
    formatter={(value) => <span style={{ color: '#6B7280', fontSize: 12 }}>{value}</span>}
  />
</PieChart>
```

### Funnel Chart - Rendimiento por Etapa

```jsx
// Custom div-based funnel (no Recharts)
<div className="funnel-chart">
  {stages.map((stage, index) => (
    <div key={stage.name} className="funnel-stage">
      <div
        className="funnel-bar"
        style={{
          width: `${(stage.count / stages[0].count) * 100}%`,
          backgroundColor: stage.color
        }}
      />
      <div className="funnel-label">
        <span className="stage-name">{stage.name}</span>
        <span className="stage-count">{stage.count} deals</span>
        {index > 0 && (
          <span className="conversion">
            {((stage.count / stages[index-1].count) * 100).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  ))}
</div>
```

### Stacked Bar - Actividad del Equipo

```jsx
<BarChart
  data={teamActivity}
  stackOffset="sign"
>
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="calls" stackId="stack" fill="#2563EB" name="Llamadas" />
  <Bar dataKey="emails" stackId="stack" fill="#7C3AED" name="Emails" />
  <Bar dataKey="meetings" stackId="stack" fill="#16A34A" name="Reuniones" />
  <Bar dataKey="tasks" stackId="stack" fill="#D97706" name="Tareas" />
</BarChart>
```

---

## Componentes de Chart

### ChartContainer

```jsx
<ChartCard
  title="Rendimiento de ventas"
  action={
    <PeriodSelector
      options={['7D', '30D', '90D']}
      onChange={setPeriod}
    />
  }
>
  <div className="chart-content">
    <AreaChart data={data} height={300}>
      {/* ... */}
    </AreaChart>
  </div>
</ChartCard>
```

### Period Selector

```jsx
<div className="period-selector">
  {options.map(opt => (
    <button
      key={opt}
      className={period === opt ? 'active' : ''}
      onClick={() => setPeriod(opt)}
    >
      {opt}
    </button>
  ))}
</div>
```

### Chart Legend

```jsx
<div className="chart-legend">
  {items.map(item => (
    <div key={item.name} className="legend-item">
      <span className="legend-dot" style={{ backgroundColor: item.color }} />
      <span className="legend-label">{item.name}</span>
      <span className="legend-value">{item.value}</span>
    </div>
  ))}
</div>
```

---

## KPI Card

```jsx
<KPICard
  label="Total clientes activos"
  value={count}
  icon="ti-users"
  iconColor="#2563EB"
  trend={{ value: 12, direction: 'up' }}
  comparison="vs mes anterior"
/>
```

### Estilos KPI

- Label: Inter 500, 12px, uppercase, #6B7280
- Value: Inter 600, 32px, tabular-nums
- Trend: pill con colors (green/red)
- Icon: 16px, colored por métrica

---

## Notas

- Usar Recharts para todo excepto Funnel (custom)
- Animación: `animationDuration={800}`
- Tooltips: custom styling, white bg
- Leyendas: below chart
- Ejes: sin líneas, solo ticks
- Grid: ausente (grids busy)