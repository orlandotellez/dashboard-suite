import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { suppliersApi } from "@/api";
import type { Supplier } from "@/api";
import { cacheGet, cacheSet, cacheClear, cacheKey } from "@/lib/simple-cache";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import TableSkeleton from "@/components/TableSkeleton";
import styles from "./Suppliers.module.css";

const LIMIT = 10;

const emptyForm = {
  name: "", contact_name: "", email: "", phone: "", address: "", notes: "", is_active: true,
};

const SKELETON_COLS = [
  { width: "30%" },
  { width: "20%" },
  { width: "15%" },
  { width: "20%" },
  { width: "10%" },
  { width: "60px", align: "center" as const },
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const cached = cacheGet<Supplier[]>(cacheKey("suppliers", 1, ""));
    return cached ?? [];
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Supplier | null | "new">(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    const key = cacheKey("suppliers", page, q);
    const cached = cacheGet<{ suppliers: Supplier[]; total: number }>(key);

    if (cached) {
      setSuppliers(cached.suppliers);
      setTotal(cached.total);
    }

    setLoading(!cached);

    const timer = setTimeout(() => {
      suppliersApi.list({ page, limit: LIMIT, search: q || undefined })
        .then((res) => {
          setSuppliers(res.suppliers);
          setTotal(res.total);
          cacheSet(key, { suppliers: res.suppliers, total: res.total });
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
    setEditing("new");
  }

  function openEdit(s: Supplier) {
    setForm({
      name: s.name,
      contact_name: s.contact_name ?? "",
      email: s.email ?? "",
      phone: s.phone ?? "",
      address: s.address ?? "",
      notes: s.notes ?? "",
      is_active: s.is_active,
    });
    setEditing(s);
  }

  function close() {
    setEditing(null);
  }

  async function save() {
    if (!editing) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        contact_name: form.contact_name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        notes: form.notes || undefined,
        is_active: form.is_active,
      };

      if (editing === "new") {
        await suppliersApi.create(payload);
      } else {
        await suppliersApi.update(editing.id, payload);
      }

      close();
      cacheClear("suppliers");
      const res = await suppliersApi.list({ page, limit: LIMIT, search: q || undefined });
      setSuppliers(res.suppliers);
      setTotal(res.total);
      cacheSet(cacheKey("suppliers", page, q), { suppliers: res.suppliers, total: res.total });
    } catch {
      alert("Error al guardar proveedor");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    try {
      await suppliersApi.delete(id);
      cacheClear("suppliers");
      const res = await suppliersApi.list({ page, limit: LIMIT, search: q || undefined });
      setSuppliers(res.suppliers);
      setTotal(res.total);
      cacheSet(cacheKey("suppliers", page, q), { suppliers: res.suppliers, total: res.total });
    } catch {
      alert("Error al eliminar proveedor");
    }
  }

  const isOpen = editing !== null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Proveedores</h1>
          <p className={styles.subtitle}>{total} proveedores registrados</p>
        </div>
        <button onClick={openNew} className={styles.primaryBtn}>
          <Plus size={16} /> Nuevo proveedor
        </button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nombre, contacto o email…"
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}><table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Nombre</th>
              <th className={styles.thLeft}>Contacto</th>
              <th className={styles.thLeft}>Teléfono</th>
              <th className={styles.thLeft}>Email</th>
              <th className={styles.thLeft}>Estado</th>
              <th className={styles.thAction}></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length > 0 ? (
              suppliers.map((s) => (
                <tr key={s.id} className={`${styles.tr} ${loading ? styles.trDim : ""}`} onClick={() => openEdit(s)}>
                  <td className={styles.tdProduct}>
                    <div className={styles.productName}>{s.name}</div>
                  </td>
                  <td className={styles.tdBarcode}>{s.contact_name ?? "—"}</td>
                  <td className={styles.tdBarcode}>{s.phone ?? "—"}</td>
                  <td className={styles.tdBarcode}>{s.email ?? "—"}</td>
                  <td className={styles.tdLeft}>
                    <span className={`${styles.badge} ${s.is_active ? styles.badgeActive : styles.badgeInactive}`}>
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
              <tr><td colSpan={6} className={styles.empty}>Sin proveedores</td></tr>
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
                {editing === "new" ? "Nuevo proveedor" : "Editar proveedor"}
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
                <label className={styles.fieldLabel}>Persona de contacto</label>
                <input
                  value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email</label>
                <input type="email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Teléfono</label>
                <input
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Dirección</label>
                <textarea
                  value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={styles.textarea} rows={3}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Notas</label>
                <textarea
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={styles.textarea} rows={3}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.checkLabel}>
                  <input type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className={styles.checkbox}
                  />
                  Activo
                </label>
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
        title="Eliminar proveedor"
        message="¿Estás seguro de que querés eliminar este proveedor? Esta acción no se puede deshacer."
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
