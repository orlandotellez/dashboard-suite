import {
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowDownRight,
} from "lucide-react";
import { MetricCard } from "@/components/global/dashboard/MetricCard";
import { InventoryCharts } from "@/components/global/dashboard/InventoryCharts";
import styles from "./Dashboard.module.css";
import { RecentMovements } from "@/components/global/dashboard/RecentMovements";
import { LowStockAlert } from "@/components/global/dashboard/LowStockAlert";

export default function Dashboard() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>
          Bienvenido de vuelta, Carlos. Aquí está el resumen de tu inventario.
        </p>
      </div>

      {/* Metrics */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Stock Total"
          value="1,847"
          change="+12.5% vs mes anterior"
          changeType="positive"
          icon={Package}
          variant="metric"
        />
        <MetricCard
          title="Productos Bajo Stock"
          value="12"
          change="5 críticos"
          changeType="negative"
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="Entradas este Mes"
          value="324"
          change="+8.3% vs mes anterior"
          changeType="positive"
          icon={ArrowDownRight}
          variant="success"
        />
        <MetricCard
          title="Valor del Inventario"
          value="$245,890"
          change="+5.2% vs mes anterior"
          changeType="positive"
          icon={TrendingUp}
          variant="metric"
        />
      </div>

      <InventoryCharts />

      <div className={styles.bottomGrid}>
        <RecentMovements />
        <LowStockAlert />
      </div>
    </div>
  );
}
