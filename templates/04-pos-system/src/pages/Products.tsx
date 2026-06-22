import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { getDemoStore, type DemoProduct } from "@/lib/demo-store";
import { money } from "@/lib/format";
import styles from "./Products.module.css";

const emptyForm = { name: "", barcode: "", category: "", price: 0, cost: 0, tax_rate: 16, stock: 0, low_stock_threshold: 5 };

export default function Products() {
  const store = useMemo(() => getDemoStore(), []);
  const [products, setProducts] = useState(store.products);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<DemoProduct | null | "new">(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() =>
    products.filter((p) =>
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      (p.barcode ?? "").includes(q) ||
      (p.category ?? "").toLowerCase().includes(q.toLowerCase())
    ),
    [products, q],
  );

  function openNew() {
    setForm(emptyForm);
    setEditing("new");
  }

  function openEdit(p: DemoProduct) {
    setForm({
      name: p.name, barcode: p.barcode ?? "", category: p.category ?? "",
      price: p.price, cost: p.cost, tax_rate: p.tax_rate,
      stock: p.stock, low_stock_threshold: p.low_stock_threshold,
    });
    setEditing(p);
  }

  function close() {
    setEditing(null);
  }

  function save() {
    const now = new Date().toISOString();
    if (editing && editing !== "new") {
      setProducts(products.map((p) =>
        p.id === editing.id
          ? { ...p, name: form.name, barcode: form.barcode || null, category: form.category || null, price: form.price, cost: form.cost, tax_rate: form.tax_rate, stock: form.stock, low_stock_threshold: form.low_stock_threshold, updated_at: now }
          : p,
      ));
    } else if (editing === "new") {
      const np: DemoProduct = {
        id: `demo-${Date.now()}`, name: form.name, barcode: form.barcode || null,
        category: form.category || null, price: form.price, cost: form.cost,
        tax_rate: form.tax_rate, stock: form.stock, low_stock_threshold: form.low_stock_threshold,
        active: true, created_at: now, updated_at: now,
      };
      setProducts([np, ...products]);
    }
    close();
  }

  function remove(id: string) {
    if (!confirm("¿Eliminar producto?")) return;
    setProducts(products.filter((p) => p.id !== id));
  }

  const isOpen = editing !== null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Productos</h1>
          <p className={styles.subtitle}>{products.length} productos en catálogo</p>
        </div>
        <button onClick={openNew} className={styles.primaryBtn}>
          <Plus size={16} /> Nuevo
        </button>
      </header>

      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, código o categoría"
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Producto</th>
              <th className={styles.thLeft}>Código</th>
              <th className={styles.thRight}>Precio</th>
              <th className={styles.thRight}>Stock</th>
              <th className={styles.thAction}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className={styles.tr}>
                <td className={styles.tdProduct}>
                  <div className={styles.productName}>{p.name}</div>
                  {p.category && <div className={styles.productCat}>{p.category}</div>}
                </td>
                <td className={styles.tdBarcode}>{p.barcode ?? "—"}</td>
                <td className={styles.tdRight}>{money(p.price)}</td>
                <td className={styles.tdRight}>
                  <span className={p.stock <= p.low_stock_threshold ? styles.stockWarning : styles.stockNormal}>
                    {p.stock}
                  </span>
                </td>
                <td className={styles.tdActions}>
                  <button onClick={() => openEdit(p)} className={styles.iconBtn} title="Editar">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(p.id!)} className={`${styles.iconBtn} ${styles.iconDanger}`} title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className={styles.empty}>Sin productos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Categoría</label>
                <input
                  value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={styles.input}
                />
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
    </div>
  );
}
