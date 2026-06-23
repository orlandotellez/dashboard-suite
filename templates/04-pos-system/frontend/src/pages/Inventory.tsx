import { useEffect, useRef, useState } from "react";
import { Search, AlertTriangle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { productsApi, type Product } from "@/api/products";
import { categoriesApi, type Category } from "@/api/categories";
import { inventoryApi, type LowStockProduct } from "@/api/inventory";
import { cacheGet, cacheSet, cacheClear, cacheKey } from "@/lib/simple-cache";
import TableSkeleton from "@/components/TableSkeleton";
import styles from "./Inventory.module.css";

const LIMIT = 10;

type AdjustState = { id: string; name: string; stock: number } | null;

const SKELETON_COLS = [
  { width: "55%" },
  { width: "20%", align: "right" as const },
  { width: "20%", align: "right" as const },
  { width: "80px", align: "center" as const },
];

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = cacheGet<{ products: Product[]; total: number; lowStock: LowStockProduct[] }>(
      cacheKey("inventory", 1, "", "")
    );
    return cached?.products ?? [];
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [q, setQ] = useState("");
  const searchRef = useRef(q);
  searchRef.current = q;
  const [adjust, setAdjust] = useState<AdjustState>(null);
  const [type, setType] = useState<"entrada" | "salida" | "ajuste">("entrada");
  const [qty, setQty] = useState(0);
  const [note, setNote] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const key = cacheKey("inventory", page, q, categoryId);
    const cached = cacheGet<{ products: Product[]; total: number; lowStock: LowStockProduct[] }>(key);

    if (cached) {
      setProducts(cached.products);
      setTotal(cached.total);
      setLowStockProducts(cached.lowStock);
    }

    setLoading(!cached);

    const timer = setTimeout(async () => {
      try {
        const [productRes, lowStockRes] = await Promise.all([
          productsApi.list({ page, limit: LIMIT, active: true, search: q || undefined, category_id: categoryId || undefined }),
          inventoryApi.lowStock(),
        ]);
        setProducts(productRes.products);
        setTotal(productRes.total);
        setLowStockProducts(lowStockRes.products);
        cacheSet(key, { products: productRes.products, total: productRes.total, lowStock: lowStockRes.products });
      } catch {
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [page, q, categoryId, refreshKey]);

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

      cacheClear("inventory");
      setRefreshKey((k) => k + 1);
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

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Buscar producto…"
            className={styles.searchInput}
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className={styles.filterSelect}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

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
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} className={loading ? styles.trDim : ""}>
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
            ) : loading ? (
              <TableSkeleton cols={SKELETON_COLS} />
            ) : (
              <tr><td colSpan={4} className={styles.empty}>Sin productos</td></tr>
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
