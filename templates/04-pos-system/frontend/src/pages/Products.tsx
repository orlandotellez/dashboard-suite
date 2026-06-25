import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { productsApi, type Product } from "@/api/products";
import { categoriesApi, type Category } from "@/api/categories";
import { suppliersApi, type Supplier } from "@/api/suppliers";
import { money } from "@/lib/format";
import { cacheGet, cacheSet, cacheClear, cacheKey } from "@/lib/simple-cache";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import TableSkeleton from "@/components/TableSkeleton";
import styles from "./Products.module.css";

const LIMIT = 10;

const UNIT_TYPE_LABELS: Record<string, string> = {
  unidad: "Unidad",
  paquete: "Paquete",
  caja: "Caja",
  bolsa: "Bolsa",
  botella: "Botella",
  lata: "Lata",
  sobre: "Sobre",
  barra: "Barra",
  rollo: "Rollo",
  galon: "Galón",
  ristra: "Ristra",
};

const emptyForm = {
  name: "", barcode: "", unit_type: "", unit_quantity: 0,
  category_id: "", supplier_id: "", price: 0, cost: 0, tax_rate: 16,
  stock: 0, low_stock_threshold: 5,
};

const SKELETON_COLS = [
  { width: "35%" },
  { width: "15%" },
  { width: "20%" },
  { width: "15%", align: "right" as const },
  { width: "15%", align: "right" as const },
  { width: "60px", align: "center" as const },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = cacheGet<Product[]>(cacheKey("products", 1, ""));
    return cached ?? [];
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const catMap = useMemo(() => {
    const m = new Map<string, Category>();
    for (const c of categories) m.set(c.id, c);
    return m;
  }, [categories]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
    suppliersApi.list().then(res => setSuppliers(res.suppliers)).catch(() => {});
  }, []);

  const searchRef = useRef(q);
  searchRef.current = q;

  useEffect(() => {
    const key = cacheKey("products", page, q, categoryId);
    const cached = cacheGet<{ products: Product[]; total: number }>(key);

    if (cached) {
      setProducts(cached.products);
      setTotal(cached.total);
    }

    setLoading(!cached);

    const timer = setTimeout(() => {
      productsApi.list({
        page,
        limit: LIMIT,
        search: q || undefined,
        category_id: categoryId || undefined,
      })
        .then((res) => {
          setProducts(res.products);
          setTotal(res.total);
          cacheSet(key, { products: res.products, total: res.total });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [page, q, categoryId]);

  function handleSearch(value: string) {
    setQ(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    setPage(1);
  }

  function openNew() {
    setForm(emptyForm);
    setEditing("new");
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      barcode: p.barcode ?? "",
      unit_type: p.unit_type ?? "",
      unit_quantity: p.unit_quantity ?? 0,
      category_id: p.category?.id ?? "",
      supplier_id: p.supplier?.id ?? "",
      price: p.price,
      cost: p.cost,
      tax_rate: p.tax_rate,
      stock: p.stock,
      low_stock_threshold: p.low_stock_threshold,
    });
    setEditing(p);
  }

  function close() {
    setEditing(null);
  }

  async function save() {
    if (!editing) return;
    try {
      const payload = {
        name: form.name,
        barcode: form.barcode || undefined,
        unit_type: form.unit_type || undefined,
        unit_quantity: form.unit_quantity || undefined,
        category_id: form.category_id || undefined,
        supplier_id: form.supplier_id || undefined,
        price: form.price,
        cost: form.cost || undefined,
        tax_rate: form.tax_rate,
        stock: form.stock,
        low_stock_threshold: form.low_stock_threshold,
      };

      if (editing === "new") {
        await productsApi.create(payload);
      } else {
        await productsApi.update(editing.id, payload);
      }

      close();
      cacheClear("products");
      const res = await productsApi.list({ page, limit: LIMIT, search: q || undefined, category_id: categoryId || undefined });
      setProducts(res.products);
      setTotal(res.total);
      cacheSet(cacheKey("products", page, q, categoryId), { products: res.products, total: res.total });
    } catch {
      alert("Error al guardar producto");
    }
  }

  async function remove(id: string) {
    try {
      await productsApi.delete(id);
      cacheClear("products");
      const res = await productsApi.list({ page, limit: LIMIT, search: q || undefined, category_id: categoryId || undefined });
      setProducts(res.products);
      setTotal(res.total);
      cacheSet(cacheKey("products", page, q, categoryId), { products: res.products, total: res.total });
    } catch {
      alert("Error al eliminar producto");
    }
  }

  const isOpen = editing !== null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Productos</h1>
          <p className={styles.subtitle}>{total} productos en catálogo</p>
        </div>
        <button onClick={openNew} className={styles.primaryBtn}>
          <Plus size={16} /> Nuevo
        </button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nombre, código o categoría"
            className={styles.searchInput}
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}><table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Producto</th>
              <th className={styles.thLeft}>Código</th>
              <th className={styles.thLeft}>Proveedor</th>
              <th className={styles.thRight}>Precio</th>
              <th className={styles.thRight}>Stock</th>
              <th className={styles.thAction}></th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} className={`${styles.tr} ${loading ? styles.trDim : ""}`} onClick={() => openEdit(p)}>
                  <td className={styles.tdProduct}>
                    <div className={styles.productName}>{p.name}</div>
                    <div className={styles.productCat}>
                      {p.category && <span>{p.category.name}</span>}
                      {p.unit_type && <span> · {UNIT_TYPE_LABELS[p.unit_type] || p.unit_type}{p.unit_quantity ? ` ${p.unit_quantity}` : ""}</span>}
                    </div>
                  </td>
                  <td className={styles.tdBarcode}>{p.barcode ?? "—"}</td>
                  <td className={styles.tdLeft}>{p.supplier?.name ?? "—"}</td>
                  <td className={styles.tdRight}>{money(p.price)}</td>
                  <td className={styles.tdRight}>
                    <span className={p.stock <= p.low_stock_threshold ? styles.stockWarning : styles.stockNormal}>
                      {p.stock}
                    </span>
                  </td>
                  <td className={styles.tdActions}>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} className={styles.iconBtn} title="Editar">
                      <Pencil size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(p.id); }} className={`${styles.iconBtn} ${styles.iconDanger}`} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : loading ? (
              <TableSkeleton cols={SKELETON_COLS} />
            ) : (
              <tr><td colSpan={6} className={styles.empty}>Sin productos</td></tr>
            )}
          </tbody>
        </table></div>

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

      {isOpen && (
        <div className={styles.overlay} onClick={close}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editing === "new" ? "Nuevo producto" : "Editar producto"}
              </h2>
              <button onClick={close} className={styles.modalClose}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); save(); }}
              className={styles.modalForm}
            >
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nombre <span className={styles.required}>*</span></label>
                <input
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={styles.input} required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Código de barras</label>
                <input
                  value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Tipo de empaque</label>
                  <select
                    value={form.unit_type} onChange={(e) => setForm({ ...form, unit_type: e.target.value })}
                    className={styles.input}
                  >
                    <option value="">Sin empaque</option>
                    {Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Cantidad x empaque</label>
                  <input type="number" min="0" value={form.unit_quantity}
                    onChange={(e) => setForm({ ...form, unit_quantity: Number(e.target.value) })}
                    className={styles.input} placeholder="Ej: 12, 24, 100"
                  />
                </div>
              </div>
              <div className={styles.field}>
                  <label className={styles.fieldLabel}>Categoría</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className={styles.input}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Proveedor</label>
                  <select
                    value={form.supplier_id}
                    onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                    className={styles.input}
                  >
                    <option value="">Sin proveedor</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Precio venta</label>
                  <input type="number" step="0.01" value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Costo</label>
                  <input type="number" step="0.01" value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>IVA %</label>
                  <input type="number" step="0.01" value={form.tax_rate}
                    onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Stock</label>
                  <input type="number" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Alerta stock bajo</label>
                  <input type="number" value={form.low_stock_threshold}
                    onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.primaryBtn}>Guardar</button>
                <button type="button" onClick={close} className={styles.secondaryBtn}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar producto"
        message="¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (deleteTarget) remove(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
