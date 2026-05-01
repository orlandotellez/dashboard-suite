import { ArrowDownRight, ArrowUpRight, Package } from "lucide-react";
import styles from "./RecentMovements.module.css";

const recentMovements = [
  {
    id: 1,
    product: "Laptop Dell XPS 15",
    type: "entrada",
    quantity: 25,
    date: "Hoy, 14:30",
    user: "María López",
  },
  {
    id: 2,
    product: "Mouse Logitech MX Master",
    type: "salida",
    quantity: 10,
    date: "Hoy, 12:15",
    user: "Juan Pérez",
  },
  {
    id: 3,
    product: 'Monitor Samsung 27"',
    type: "entrada",
    quantity: 15,
    date: "Hoy, 10:00",
    user: "Carlos García",
  },
  {
    id: 4,
    product: "Teclado Mecánico RGB",
    type: "salida",
    quantity: 8,
    date: "Ayer, 16:45",
    user: "Ana Martínez",
  },
  {
    id: 5,
    product: "Webcam Logitech C920",
    type: "entrada",
    quantity: 30,
    date: "Ayer, 11:20",
    user: "María López",
  },
];

export function RecentMovements() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Movimientos Recientes</h3>

      <div className={styles.list}>
        {recentMovements.map((movement) => (
          <div key={movement.id} className={styles.item}>
            <div
              className={`${styles.iconBox} ${
                movement.type === "entrada"
                  ? styles.iconEntrada
                  : styles.iconSalida
              }`}
            >
              {movement.type === "entrada" ? (
                <ArrowDownRight className={styles.icon} />
              ) : (
                <ArrowUpRight className={styles.icon} />
              )}
            </div>

            <div className={styles.info}>
              <div className={styles.productRow}>
                <Package className={styles.productIcon} />
                <span className={styles.productName}>{movement.product}</span>
              </div>
              <p className={styles.meta}>
                {movement.user} • {movement.date}
              </p>
            </div>

            <div className={styles.quantity}>
              <span
                className={`${styles.badge} ${
                  movement.type === "entrada"
                    ? styles.badgePositive
                    : styles.badgeNegative
                }`}
              >
                {movement.type === "entrada" ? "+" : "-"}
                {movement.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
