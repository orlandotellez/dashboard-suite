import { useEffect, useRef, useState } from "react";
import { Search, AlertTriangle, X, ChevronLeft, ChevronRight, ArrowDownRight, ArrowUpRight, RefreshCw, Eye } from "lucide-react";
import { productsApi, type Product } from "@/api/products";
import { categoriesApi, type Category } from "@/api/categories";
import { inventoryApi, type InventoryMovement, type LowStockProduct } from "@/api/inventory";
import { cacheGet, cacheSet, cacheClear, cacheKey } from "@/lib/simple-cache";
import { suppliersApi } from "@/api/suppliers";
import type { Supplier, BatchResponse, CreateBatchPayload } from "@/api";
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

  // Movement history
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [movementsTotal, setMovementsTotal] = useState(0);
  const [movementPage, setMovementPage] = useState(1);
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
  const MOVEMENT_LIMIT = 10;

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const movementsTotalPages = Math.max(1, Math.ceil(movementsTotal / MOVEMENT_LIMIT));

  type BatchFormItem = {
    id: string;
    productSearch: string;
    selectedProduct: Product | null;
    quantity: number;
    unitCost: number | null;
    notes: string;
    showDropdown: boolean;
  };
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchType, setBatchType] = useState<"entrada" | "salida" | "ajuste">("entrada");
  const [batchSupplierId, setBatchSupplierId] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const [batchItems, setBatchItems] = useState<BatchFormItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [batches, setBatches] = useState<BatchResponse[]>([]);
  const [batchesTotal, setBatchesTotal] = useState(0);
  const [batchPage, setBatchPage] = useState(1);
  const [batchDetail, setBatchDetail] = useState<BatchResponse | null>(null);
  const BATCH_LIMIT = 10;

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
    suppliersApi.list().then(res => setSuppliers(res.suppliers)).catch(() => {});
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

  // ─── Fetch movement history ───
  useEffect(() => {
    inventoryApi.list({ page: movementPage, limit: MOVEMENT_LIMIT }).then((res) => {
      setMovements(res.movements);
      setMovementsTotal(res.total);
    }).catch(() => {});
  }, [movementPage, refreshKey]);

  useEffect(() => {
    inventoryApi.batchList({ page: batchPage, limit: BATCH_LIMIT }).then((res) => {
      setBatches(res.batches);
      setBatchesTotal(res.total);
    }).catch(() => {});
  }, [batchPage, refreshKey]);

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

  function searchProducts(query: string): Product[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    ).slice(0, 8);
  }

  let _itemIdCounter = 0;
  function addBatchItem() {
    _itemIdCounter++;
    setBatchItems(prev => [...prev, {
      id: `bi_${_itemIdCounter}`,
      productSearch: "",
      selectedProduct: null,
      quantity: 0,
      unitCost: null,
      notes: "",
      showDropdown: false,
    }]);
  }

  function removeBatchItem(id: string) {
    setBatchItems(prev => prev.filter(i => i.id !== id));
  }

  function updateBatchItem(id: string, updates: Partial<BatchFormItem>) {
    setBatchItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }

  function selectProductForItem(itemId: string, product: Product) {
    updateBatchItem(itemId, {
      selectedProduct: product,
      productSearch: product.name,
      showDropdown: false,
    });
  }

  async function submitBatch(e: React.FormEvent) {
    e.preventDefault();
    const validItems = batchItems.filter(i => i.selectedProduct && i.quantity > 0);
    if (validItems.length === 0) { alert("Agrega al menos un producto con cantidad válida"); return; }
    setSubmitting(true);
    try {
      const payload: CreateBatchPayload = {
        movement_type: batchType,
        supplier_id: batchType === "entrada" && batchSupplierId ? batchSupplierId : null,
        notes: batchNotes || null,
        items: validItems.map(i => ({
          product_id: i.selectedProduct!.id,
          quantity: i.quantity,
          unit_cost: i.unitCost ?? null,
          notes: i.notes || null,
        })),
      };
      await inventoryApi.batchCreate(payload);
      setBatchModalOpen(false);
      setBatchType("entrada");
      setBatchSupplierId("");
      setBatchNotes("");
      setBatchItems([]);
      cacheClear("inventory");
      setRefreshKey(k => k + 1);
    } catch {
      alert("Error al registrar movimiento agrupado");
    } finally {
      setSubmitting(false);
    }
  }

  async function openBatchDetail(batch: BatchResponse) {
    try {
      const detail = await inventoryApi.batchGetById(batch.id);
      setBatchDetail(detail);
    } catch {
      alert("Error al cargar detalle");
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.h1}>Inventario</h1>
            <p className={styles.subtitle}>Control de stock en tiempo real</p>
          </div>
          <button onClick={() => setBatchModalOpen(true)} className={styles.primaryBtnSmall}>
            Nuevo movimiento agrupado
          </button>
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

      {/* ─── Movement history ─── */}
      <section className={styles.movementSection}>
        <h2 className={styles.movementSectionTitle}>Historial de movimientos</h2>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thLeft}>Producto</th>
                <th className={styles.thLeft}>Tipo</th>
                <th className={styles.thRight}>Cantidad</th>
                <th className={styles.thLeft}>Nota</th>
                <th className={styles.thRight}>Fecha</th>
                <th className={styles.thAction}></th>
              </tr>
            </thead>
            <tbody>
              {movements.length > 0 ? (
                movements.map((m) => (
                  <tr key={m.id} className={styles.movementRow} onClick={() => setSelectedMovement(m)}>
                    <td className={styles.tdProduct}>{m.product_name ?? "—"}</td>
                    <td className={styles.tdLeft}>
                      <span className={`${styles.movementBadge} ${styles[`movement_${m.movement_type}`] ?? ""}`}>
                        {m.movement_type === "entrada" && <ArrowDownRight size={14} />}
                        {m.movement_type === "salida" && <ArrowUpRight size={14} />}
                        {m.movement_type === "ajuste" && <RefreshCw size={14} />}
                        {m.movement_type === "venta" && <ArrowUpRight size={14} />}
                        {m.movement_type === "entrada" && " Entrada"}
                        {m.movement_type === "salida" && " Salida"}
                        {m.movement_type === "ajuste" && " Ajuste"}
                        {m.movement_type === "venta" && " Venta"}
                        {!"entrada|salida|ajuste|venta".includes(m.movement_type) && m.movement_type}
                      </span>
                    </td>
                    <td className={`${styles.tdRight} ${styles.movementQty}`}>
                      {m.movement_type === "entrada" || m.movement_type === "venta" ? "+" : m.movement_type === "salida" ? "−" : ""}
                      {m.quantity}
                    </td>
                    <td className={styles.tdLeft}>
                      <span className={styles.movementNote}>{m.note ?? "—"}</span>
                    </td>
                    <td className={styles.tdRightMuted}>
                      {new Date(m.created_at).toLocaleString("es-MX", {
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className={styles.tdActions}>
                      <Eye size={14} className={styles.eyeIcon} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className={styles.empty}>Sin movimientos</td></tr>
              )}
            </tbody>
          </table>

          {movementsTotalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setMovementPage((p) => Math.max(1, p - 1))}
                disabled={movementPage <= 1}
                className={styles.pageBtn}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: movementsTotalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setMovementPage(n)}
                  className={`${styles.pageBtn} ${n === movementPage ? styles.pageActive : ""}`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setMovementPage((p) => Math.min(movementsTotalPages, p + 1))}
                disabled={movementPage >= movementsTotalPages}
                className={styles.pageBtn}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className={styles.movementSection}>
        <h2 className={styles.movementSectionTitle}>Historial de movimientos agrupados</h2>
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thLeft}>Fecha</th>
                <th className={styles.thLeft}>Tipo</th>
                <th className={styles.thLeft}>Proveedor</th>
                <th className={styles.thRight}>Items</th>
                <th className={styles.thRight}>Total unidades</th>
                <th className={styles.thAction}></th>
              </tr>
            </thead>
            <tbody>
              {batches.length > 0 ? (
                batches.map((b) => (
                  <tr key={b.id} className={styles.movementRow} onClick={() => openBatchDetail(b)}>
                    <td className={styles.tdProduct}>
                      {new Date(b.created_at).toLocaleString("es-MX", {
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className={styles.tdLeft}>
                      <span className={`${styles.movementBadge} ${styles[`movement_${b.movement_type}`] ?? ""}`}>
                        {b.movement_type === "entrada" && " Entrada"}
                        {b.movement_type === "salida" && " Salida"}
                        {b.movement_type === "ajuste" && " Ajuste"}
                      </span>
                    </td>
                    <td className={styles.tdLeft}>{b.supplier_name ?? "—"}</td>
                    <td className={styles.tdRight}>{b.total_items}</td>
                    <td className={styles.tdRight}>{b.total_quantity}</td>
                    <td className={styles.tdActions}><Eye size={14} className={styles.eyeIcon} /></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className={styles.empty}>Sin movimientos agrupados</td></tr>
              )}
            </tbody>
          </table>

          {batchesTotal > BATCH_LIMIT && (
            <div className={styles.pagination}>
              <button
                onClick={() => setBatchPage(p => Math.max(1, p - 1))}
                disabled={batchPage <= 1}
                className={styles.pageBtn}
              ><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.ceil(batchesTotal / BATCH_LIMIT) }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setBatchPage(n)}
                  className={`${styles.pageBtn} ${n === batchPage ? styles.pageActive : ""}`}
                >{n}</button>
              ))}
              <button
                onClick={() => setBatchPage(p => Math.min(Math.ceil(batchesTotal / BATCH_LIMIT), p + 1))}
                disabled={batchPage >= Math.ceil(batchesTotal / BATCH_LIMIT)}
                className={styles.pageBtn}
              ><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </section>

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

      {selectedMovement && (
        <div className={styles.overlayCenter} onClick={() => setSelectedMovement(null)}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalle del movimiento</h2>
              <button onClick={() => setSelectedMovement(null)} className={styles.modalClose}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.detailBody}>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Producto</span>
                <span className={styles.detailValue}>{selectedMovement.product_name ?? "—"}</span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Tipo</span>
                <span className={`${styles.movementBadge} ${styles[`movement_${selectedMovement.movement_type}`] ?? ""}`}>
                  {selectedMovement.movement_type === "entrada" && <ArrowDownRight size={14} />}
                  {selectedMovement.movement_type === "salida" && <ArrowUpRight size={14} />}
                  {selectedMovement.movement_type === "ajuste" && <RefreshCw size={14} />}
                  {selectedMovement.movement_type === "venta" && <ArrowUpRight size={14} />}
                  {selectedMovement.movement_type === "entrada" && " Entrada"}
                  {selectedMovement.movement_type === "salida" && " Salida"}
                  {selectedMovement.movement_type === "ajuste" && " Ajuste"}
                  {selectedMovement.movement_type === "venta" && " Venta"}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Cantidad</span>
                <span className={styles.detailValue}>
                  {selectedMovement.movement_type === "entrada" || selectedMovement.movement_type === "venta" ? "+" : selectedMovement.movement_type === "salida" ? "−" : ""}
                  {selectedMovement.quantity}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Fecha</span>
                <span className={styles.detailValue}>
                  {new Date(selectedMovement.created_at).toLocaleString("es-MX")}
                </span>
              </div>
              {selectedMovement.note && (
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>Nota</span>
                  <p className={styles.detailNote}>{selectedMovement.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {batchModalOpen && (
        <div className={styles.overlay} onClick={() => { if (!submitting) setBatchModalOpen(false); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Movimiento agrupado</h2>
              <button onClick={() => setBatchModalOpen(false)} className={styles.modalClose} disabled={submitting}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitBatch} className={styles.modalForm}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Tipo de movimiento</label>
                <select value={batchType} onChange={(e) => setBatchType(e.target.value as any)} className={styles.select}>
                  <option value="entrada">Entrada (compra)</option>
                  <option value="salida">Salida (merma)</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>

              {batchType === "entrada" && (
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Proveedor</label>
                  <select value={batchSupplierId} onChange={(e) => setBatchSupplierId(e.target.value)} className={styles.select}>
                    <option value="">Sin proveedor</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Notas generales (opcional)</label>
                <textarea
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="Notas del movimiento"
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Productos</label>
                <div className={styles.batchFormItems}>
                  {batchItems.map((item) => (
                    <div key={item.id} className={styles.batchFormItem}>
                      <div className={styles.batchFormItemRow}>
                        <div className={styles.batchFormSearchWrap}>
                          <input
                            value={item.productSearch}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateBatchItem(item.id, { productSearch: val, selectedProduct: null, showDropdown: true });
                            }}
                            onBlur={() => setTimeout(() => updateBatchItem(item.id, { showDropdown: false }), 200)}
                            placeholder="Buscar producto…"
                            className={styles.batchFormSearchInput}
                          />
                          {item.showDropdown && item.productSearch && (
                            <div className={styles.batchDropdown}>
                              {searchProducts(item.productSearch).map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => selectProductForItem(item.id, p)}
                                  className={styles.batchDropdownItem}
                                >
                                  <span>{p.name}</span>
                                  <span className={styles.batchDropdownStock}>Stock: {p.stock}</span>
                                </button>
                              ))}
                              {searchProducts(item.productSearch).length === 0 && (
                                <div className={styles.batchDropdownEmpty}>Sin resultados</div>
                              )}
                            </div>
                          )}
                        </div>
                        <input
                          type="number" min={1} value={item.quantity || ""}
                          onChange={(e) => updateBatchItem(item.id, { quantity: Math.max(0, Number(e.target.value)) })}
                          placeholder="Cant."
                          className={styles.batchFormQtyInput}
                        />
                        <input
                          type="number" min={0} step={0.01}
                          value={item.unitCost ?? ""}
                          onChange={(e) => updateBatchItem(item.id, { unitCost: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Costo"
                          className={styles.batchFormCostInput}
                        />
                        <button type="button" onClick={() => removeBatchItem(item.id)} className={styles.batchFormRemove}>
                          <X size={16} />
                        </button>
                      </div>
                      <input
                        value={item.notes}
                        onChange={(e) => updateBatchItem(item.id, { notes: e.target.value })}
                        placeholder="Notas del producto (opcional)"
                        className={styles.batchFormNotesInput}
                      />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addBatchItem} className={styles.outlineBtn}>
                  + Agregar producto
                </button>
              </div>

              {batchItems.filter(i => i.selectedProduct).length > 0 && (
                <div className={styles.batchSummary}>
                  <div className={styles.batchSummaryTitle}>Resumen</div>
                  <div className={styles.batchSummaryGrid}>
                    <div className={styles.batchSummaryItem}>
                      <span className={styles.batchSummaryLabel}>Productos</span>
                      <span className={styles.batchSummaryValue}>{batchItems.filter(i => i.selectedProduct).length}</span>
                    </div>
                    <div className={styles.batchSummaryItem}>
                      <span className={styles.batchSummaryLabel}>Total unidades</span>
                      <span className={styles.batchSummaryValue}>
                        {batchItems.reduce((sum, i) => sum + (i.quantity || 0), 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                {submitting ? "Registrando…" : "Registrar movimiento agrupado"}
              </button>
            </form>
          </div>
        </div>
      )}

      {batchDetail && (
        <div className={styles.overlayCenter} onClick={() => setBatchDetail(null)}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalle del movimiento agrupado</h2>
              <button onClick={() => setBatchDetail(null)} className={styles.modalClose}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.detailBody}>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Tipo</span>
                <span className={`${styles.movementBadge} ${styles[`movement_${batchDetail.movement_type}`] ?? ""}`}>
                  {batchDetail.movement_type === "entrada" && <ArrowDownRight size={14} />}
                  {batchDetail.movement_type === "salida" && <ArrowUpRight size={14} />}
                  {batchDetail.movement_type === "ajuste" && <RefreshCw size={14} />}
                  {batchDetail.movement_type === "entrada" && " Entrada"}
                  {batchDetail.movement_type === "salida" && " Salida"}
                  {batchDetail.movement_type === "ajuste" && " Ajuste"}
                </span>
              </div>
              {batchDetail.supplier_name && (
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>Proveedor</span>
                  <span className={styles.detailValue}>{batchDetail.supplier_name}</span>
                </div>
              )}
              {batchDetail.user_name && (
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>Usuario</span>
                  <span className={styles.detailValue}>{batchDetail.user_name}</span>
                </div>
              )}
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Fecha</span>
                <span className={styles.detailValue}>{new Date(batchDetail.created_at).toLocaleString("es-MX")}</span>
              </div>
              {batchDetail.notes && (
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>Notas</span>
                  <p className={styles.detailNote}>{batchDetail.notes}</p>
                </div>
              )}

              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Productos ({batchDetail.total_items})</span>
                <table className={styles.batchDetailTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className={styles.thRight}>Cantidad</th>
                      <th className={styles.thRight}>Costo unit.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(batchDetail.items ?? []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.product_name ?? "—"}</td>
                        <td className={styles.tdRight}>{item.quantity}</td>
                        <td className={styles.tdRight}>{item.unit_cost != null ? `$${Number(item.unit_cost).toFixed(2)}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className={styles.batchDetailHint}>
                Los movimientos individuales de este lote están disponibles en el historial general.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
