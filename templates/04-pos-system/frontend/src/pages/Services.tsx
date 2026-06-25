import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { servicesApi, type Service, type ServiceProduct } from "@/api/services";
import { productsApi, type Product } from "@/api/products";
import { money } from "@/lib/format";
import { cacheGet, cacheSet, cacheClear, cacheKey } from "@/lib/simple-cache";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import TableSkeleton from "@/components/TableSkeleton";
import styles from "./Services.module.css";

const LIMIT = 10;

const emptyForm = {
  name: "", description: "", base_price: 0,
};

const SKELETON_COLS = [
  { width: "30%" },
  { width: "35%" },
  { width: "20%", align: "right" as const },
  { width: "15%" },
  { width: "60px", align: "center" as const },
];

export default function Services() {
  const [services, setServices] = useState<Service[]>(() => {
    const cached = cacheGet<Service[]>(cacheKey("services", 1, ""));
    return cached ?? [];
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null | "new">(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedProducts, setSelectedProducts] = useState<{ product_id: string; product_name: string; quantity: number }[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    productsApi.list({ active: true, limit: 100 })
      .then((res) => setProducts(res.products))
      .catch(() => {});
  }, []);

  const searchRef = useRef(q);
  searchRef.current = q;

  useEffect(() => {
    const key = cacheKey("services", page, q);
    const cached = cacheGet<{ services: Service[]; total: number }>(key);

    if (cached) {
      setServices(cached.services);
      setTotal(cached.total);
    }

    setLoading(!cached);

    const timer = setTimeout(() => {
      servicesApi.list({
        page,
        limit: LIMIT,
        search: q || undefined,
      })
        .then((res) => {
          setServices(res.services);
          setTotal(res.total);
          cacheSet(key, { services: res.services, total: res.total });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [page, q]);

  function handleSearch(value: string) {
    setQ(value);
    setPage(1);
  }

  function openNew() {
    setForm(emptyForm);
    setSelectedProducts([]);
    setEditing("new");
  }

  function openEdit(s: Service) {
    setForm({
      name: s.name,
      description: s.description ?? "",
      base_price: s.base_price,
    });
    setSelectedProducts(
      s.products.map((sp) => ({
        product_id: sp.product_id,
        product_name: sp.product_name,
        quantity: sp.quantity,
      }))
    );
    setEditing(s);
  }

  function close() {
    setEditing(null);
  }

  function addProduct() {
    const available = products.filter(
      (p) => !selectedProducts.find((sp) => sp.product_id === p.id)
    );
    if (available.length === 0) return;
    const first = available[0];
    setSelectedProducts([...selectedProducts, { product_id: first.id, product_name: first.name, quantity: 1 }]);
  }

  function removeProduct(productId: string) {
    setSelectedProducts(selectedProducts.filter((sp) => sp.product_id !== productId));
  }

  function updateProductQty(productId: string, qty: number) {
    if (qty <= 0) {
      removeProduct(productId);
      return;
    }
    setSelectedProducts(
      selectedProducts.map((sp) =>
        sp.product_id === productId ? { ...sp, quantity: qty } : sp
      )
    );
  }

  function changeProductInRow(oldProductId: string, newProductId: string) {
    const prod = products.find((p) => p.id === newProductId);
    if (!prod) return;
    // If the new product is already selected in a DIFFERENT row, do nothing
    if (selectedProducts.find((sp) => sp.product_id === newProductId && sp.product_id !== oldProductId)) {
      return;
    }
    setSelectedProducts(
      selectedProducts.map((sp) =>
        sp.product_id === oldProductId
          ? { ...sp, product_id: prod.id, product_name: prod.name }
          : sp
      )
    );
  }

  async function save() {
    if (!editing) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        base_price: form.base_price,
        products: selectedProducts.map((sp) => ({
          product_id: sp.product_id,
          quantity: sp.quantity,
        })),
      };

      if (editing === "new") {
        await servicesApi.create(payload);
      } else {
        await servicesApi.update(editing.id, payload);
      }

      close();
      cacheClear("services");
      const res = await servicesApi.list({ page, limit: LIMIT, search: q || undefined });
      setServices(res.services);
      setTotal(res.total);
      cacheSet(cacheKey("services", page, q), { services: res.services, total: res.total });
    } catch {
      alert("Error al guardar servicio");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    try {
      await servicesApi.delete(id);
      cacheClear("services");
      const res = await servicesApi.list({ page, limit: LIMIT, search: q || undefined });
      setServices(res.services);
      setTotal(res.total);
      cacheSet(cacheKey("services", page, q), { services: res.services, total: res.total });
    } catch {
      alert("Error al eliminar servicio");
    }
  }

  const isOpen = editing !== null;

  const availableProducts = products.filter(
    (p) => !selectedProducts.find((sp) => sp.product_id === p.id)
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Servicios</h1>
          <p className={styles.subtitle}>{total} servicios en catálogo</p>
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
            placeholder="Buscar por nombre..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}><table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Servicio</th>
              <th className={styles.thLeft}>Descripción</th>
              <th className={styles.thRight}>Precio Base</th>
              <th className={styles.thCenter}>Estado</th>
              <th className={styles.thAction}></th>
            </tr>
          </thead>
          <tbody>
            {services.length > 0 ? (
              services.map((s) => (
                <tr key={s.id} className={`${styles.tr} ${loading ? styles.trDim : ""}`} onClick={() => openEdit(s)}>
                  <td className={styles.tdProduct}>
                    <div className={styles.productName}>{s.name}</div>
                    <div className={styles.productCat}>
                      {s.products.length > 0 && (
                        <span>{s.products.length} producto{s.products.length !== 1 ? "s" : ""} asociado{s.products.length !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.tdDesc}>{s.description || "—"}</td>
                  <td className={styles.tdRight}>{money(s.base_price)}</td>
                  <td className={styles.tdCenter}>
                    <span className={s.is_active ? styles.statusActive : styles.statusInactive}>
                      {s.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className={styles.tdActions}>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(s); }} className={styles.iconBtn} title="Editar">
                      <Pencil size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(s.id); }} className={`${styles.iconBtn} ${styles.iconDanger}`} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : loading ? (
              <TableSkeleton cols={SKELETON_COLS} />
            ) : (
              <tr><td colSpan={5} className={styles.empty}>Sin servicios</td></tr>
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
                {editing === "new" ? "Nuevo servicio" : "Editar servicio"}
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
                <label className={styles.fieldLabel}>Descripción</label>
                <textarea
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={styles.textarea} rows={3}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Precio base <span className={styles.required}>*</span></label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.base_price}
                  onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
                  className={styles.input} required
                />
              </div>

              {/* Productos asociados */}
              <div className={styles.field}>
                <div className={styles.productsSectionHeader}>
                  <label className={styles.fieldLabel}>Productos asociados</label>
                  <button type="button" onClick={addProduct} className={styles.addProductBtn}>
                    <Plus size={14} /> Agregar producto
                  </button>
                </div>

                {selectedProducts.length === 0 ? (
                  <div className={styles.noProducts}>
                    <Package size={20} />
                    <span>Sin productos asociados. Agregá los productos que utiliza este servicio.</span>
                  </div>
                ) : (
                  <div className={styles.productsList}>
                    {selectedProducts.map((sp) => (
                      <div key={sp.product_id} className={styles.productRow}>
                        <select
                          value={sp.product_id}
                          onChange={(e) => changeProductInRow(sp.product_id, e.target.value)}
                          className={styles.productSelect}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {money(p.price)}
                            </option>
                          ))}
                        </select>
                        <div className={styles.qtyWrapper}>
                          <span className={styles.qtyLabel}>Cant:</span>
                          <input
                            type="number" min="1" value={sp.quantity}
                            onChange={(e) => updateProductQty(sp.product_id, Number(e.target.value))}
                            className={styles.qtyInput}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProduct(sp.product_id)}
                          className={styles.removeProductBtn}
                          title="Quitar producto"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                  {submitting ? "Guardando…" : "Guardar"}
                </button>
                <button type="button" onClick={close} className={styles.secondaryBtn}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar servicio"
        message="¿Estás seguro de que querés eliminar este servicio? Esta acción no se puede deshacer."
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
