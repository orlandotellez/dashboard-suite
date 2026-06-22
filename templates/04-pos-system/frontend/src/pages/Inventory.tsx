import { useEffect, useState } from "react";
import { AlertTriangle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { productsApi, type Product } from "@/api/products";
import { inventoryApi, type LowStockProduct } from "@/api/inventory";
import styles from "./Inventory.module.css";

const LIMIT = 10;

type AdjustState = { id: string; name: string; stock: number } | null;

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [adjust, setAdjust] = useState<AdjustState>(null);
  const [type, setType] = useState<"entrada" | "salida" | "ajuste">("entrada");
  const [qty, setQty] = useState(0);
  const [note, setNote] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const [productRes, lowStockRes] = await Promise.all([
        productsApi.list({ page: p, limit: LIMIT, active: true }),
        inventoryApi.lowStock(),
      ]);
      setProducts(productRes.products);
      setTotal(productRes.total);
      setLowStockProducts(lowStockRes.products);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  async function apply() {
    if (!adjust) return;
    try {
      await inventoryApi.create({
        product_id: adjust.id,
        movement_type: type,
        quantity: type === "ajuste" ? qty - adjust.stock : qty,
        note: note || undefined,
      });

      setAdjust(null);
      setQty(0);
      setNote("");
      setType("entrada");

      fetchData(page);
    } catch {
      alert("Error al ajustar inventario");
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Inventario</h1>
          <p className={styles.subtitle}>Control de stock en tiempo real</p>
        </div>
      </header>

      {lowStockProducts.length > 0 && (
        <div className={styles.alert}>
          <AlertTriangle size={16} className={styles.alertIcon} />
          <div>
            <div className={styles.alertTitle}>{lowStockProducts.length} producto(s) con stock bajo</div>
            <div className={styles.alertDesc}>
              {lowStockProducts.slice(0, 5).map((p) => p.product_name).join(", ")}
              {lowStockProducts.length > 5 ? "…" : ""}
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
            {loading ? (
              <tr><td colSpan={4} className={styles.empty}>Cargando…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={4} className={styles.empty}>Sin productos</td></tr>
            ) : (
              products.map((p) => (
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
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={styles.pageBtn}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`${styles.pageBtn} ${n === page ? styles.pageActive : ""}`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={styles.pageBtn}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

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
