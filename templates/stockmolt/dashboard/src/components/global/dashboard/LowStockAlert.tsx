import { AlertTriangle } from "lucide-react";
import styles from "./LowStockAlert.module.css";

const lowStockProducts = [
  {
    id: 1,
    name: "Teclado Mecánico RGB",
    stock: 3,
    minStock: 10,
    category: "Periféricos",
  },
  {
    id: 2,
    name: 'Monitor 24" LED',
    stock: 5,
    minStock: 15,
    category: "Monitores",
  },
  { id: 3, name: "Cable HDMI 2m", stock: 8, minStock: 25, category: "Cables" },
  {
    id: 4,
    name: "Auriculares Bluetooth",
    stock: 4,
    minStock: 12,
    category: "Audio",
  },
  {
    id: 5,
    name: "Hub USB-C 7 puertos",
    stock: 2,
    minStock: 8,
    category: "Accesorios",
  },
];

export function LowStockAlert() {
  return (
    <div className={`${styles.card} ${styles.warning}`}>
      <div className={styles.header}>
        <AlertTriangle className={styles.headerIcon} />
        <h3>Productos con Bajo Stock</h3>
      </div>

      <div className={styles.list}>
        {lowStockProducts.map((product) => (
          <div key={product.id} className={styles.item}>
            <div>
              <p className={styles.name}>{product.name}</p>
              <p className={styles.category}>{product.category}</p>
            </div>

            <span className={styles.badge}>
              {product.stock} / {product.minStock}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
