import { useMemo, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { getDemoStore } from "@/lib/demo-store";
import styles from "./Inventory.module.css";

type AdjustState = { id: string; name: string; stock: number } | null;

export default function Inventory() {
  const store = useMemo(() => getDemoStore(), []);
  const [products, setProducts] = useState(store.products);
  const [adjust, setAdjust] = useState<AdjustState>(null);
  const [type, setType] = useState<"entrada" | "salida" | "ajuste">("entrada");
  const [qty, setQty] = useState(0);
  const [note, setNote] = useState("");

  const lowStock = products.filter((p) => p.stock <= p.low_stock_threshold && p.active);

  function apply() {
    if (!adjust) return;
    const now = new Date().toISOString();
    let newStock = adjust.stock;
    let movementQty = qty;
    if (type === "entrada") { newStock += qty; }
    else if (type === "salida") { newStock -= qty; movementQty = -qty; }
    else { newStock = qty; movementQty = qty - adjust.stock; }

    setProducts(products.map((p) =>
      p.id === adjust.id ? { ...p, stock: newStock, updated_at: now } : p,
    ));

    store.movements.push({
      id: `mov-${Date.now()}`, product_id: adjust.id,
      movement_type: type, quantity: movementQty,
      note: note || null, user_id: store.user.id, created_at: now,
    });

    setAdjust(null); setQty(0); setNote(""); setType("entrada");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Inventario</h1>
          <p className={styles.subtitle}>Control de stock en tiempo real</p>
        </div>
      </header>

      {lowStock.length > 0 && (
        <div className={styles.alert}>
          <AlertTriangle size={16} className={styles.alertIcon} />
          <div>
            <div className={styles.alertTitle}>{lowStock.length} producto(s) con stock bajo</div>
            <div className={styles.alertDesc}>
              {lowStock.slice(0, 5).map((p) => p.name).join(", ")}{lowStock.length > 5 ? "…" : ""}
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Producto</th>
              <th className={styles.thRight}>Stock</th>
              <th className={styles.thRight}>Umbral</th>
              <th className={styles.thAction}></th>
            </tr>
          </thead>
          <tbody>
            {products.filter((p) => p.active).map((p) => (
              <tr key={p.id}>
                <td className={styles.tdProduct}>
                  <div className={styles.productName}>{p.name}</div>
                  {p.barcode && <div className={styles.productBarcode}>{p.barcode}</div>}
                </td>
                <td className={styles.tdRight}>
                  <span className={p.stock <= p.low_stock_threshold ? styles.stockWarning : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className={styles.tdRightMuted}>{p.low_stock_threshold}</td>
                <td className={styles.tdActions}>
                  <button
                    onClick={() => setAdjust({ id: p.id, name: p.name, stock: p.stock })}
                    className={styles.outlineBtn}
                  >
                    Ajustar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {adjust && (
        <div className={styles.overlay} onClick={() => setAdjust(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Ajustar inventario</h2>
              <button onClick={() => setAdjust(null)} className={styles.modalClose}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); apply(); }}
              className={styles.modalForm}
            >
              <div className={styles.currentStock}>
                <div className={styles.currentStockName}>{adjust.name}</div>
                <div className={styles.currentStockValue}>
                  Stock actual: <span className="tabular">{adjust.stock}</span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Tipo de movimiento</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} className={styles.select}>
                  <option value="entrada">Entrada (compra)</option>
                  <option value="salida">Salida (merma)</option>
                  <option value="ajuste">Ajuste a nuevo valor</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  {type === "ajuste" ? "Nuevo stock" : "Cantidad"}
                </label>
                <input
                  type="number" min={0} value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className={styles.input} required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nota (opcional)</label>
                <input
                  value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Motivo o referencia"
                  className={styles.input}
                />
              </div>

              <button type="submit" className={styles.primaryBtn}>Aplicar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
