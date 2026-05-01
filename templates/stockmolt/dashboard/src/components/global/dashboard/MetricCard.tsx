import { LucideIcon } from "lucide-react";
import styles from "./MetricCard.module.css";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "default" | "metric" | "warning" | "success" | "destructive";
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  variant = "metric",
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
                changeType === "positive"
                  ? styles.positive
                  : changeType === "negative"
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
