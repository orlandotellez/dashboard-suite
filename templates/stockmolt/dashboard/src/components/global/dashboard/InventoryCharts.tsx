import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import styles from "./InventoryCharts.module.css";

const monthlyData = [
  { month: "Ene", entradas: 120, salidas: 90 },
  { month: "Feb", entradas: 150, salidas: 110 },
  { month: "Mar", entradas: 180, salidas: 140 },
  { month: "Abr", entradas: 140, salidas: 120 },
  { month: "May", entradas: 200, salidas: 160 },
  { month: "Jun", entradas: 170, salidas: 130 },
];

const stockTrendData = [
  { month: "Ene", stock: 1200 },
  { month: "Feb", stock: 1350 },
  { month: "Mar", stock: 1480 },
  { month: "Abr", stock: 1520 },
  { month: "May", stock: 1680 },
  { month: "Jun", stock: 1847 },
];

export function InventoryCharts() {
  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <h3 className={styles.title}>Movimientos Mensuales</h3>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="entradas"
                fill="var(--secondary-color)"
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="salidas" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.title}>Tendencia de Stock Total</h3>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stockTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="stock"
                stroke="var(--secondary-color)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
