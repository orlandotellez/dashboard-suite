import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, X, Shield, ShieldOff } from "lucide-react";
import { usersApi, type UserResponse } from "@/api/users";
import TableSkeleton, { type SkeletonCol } from "@/components/TableSkeleton";
import { useAuth } from "@/context/AuthContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import styles from "./Users.module.css";

export default function Users() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UserResponse | null | "new">(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "cajero" as string, phone: "" });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const LIMIT = 10;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const SKELETON_COLS: SkeletonCol[] = [
    { width: "35%" },
    { width: "35%" },
    { width: "15%" },
    { width: "10%", align: "right" },
    { width: "5%", align: "center" },
  ];

  const fetchUsers = async (p: number, search: string) => {
    setLoading(true);
    try {
      const res = await usersApi.list({ page: p, limit: LIMIT, search: search || undefined });
      setUsers(res.users);
      setTotal(res.total);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(page, q);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, q]);

  function openNew() {
    setForm({ name: "", email: "", password: "", role: "cajero", phone: "" });
    setEditing("new");
  }

  function openEdit(u: UserResponse) {
    setForm({ name: u.name, email: u.email, password: "", role: u.role, phone: u.phone ?? "" });
    setEditing(u);
  }

  function close() {
    setEditing(null);
  }

  async function save() {
    if (!editing) return;
    setSubmitting(true);
    try {
      if (editing === "new") {
        await usersApi.create({ name: form.name, email: form.email, password: form.password, role: form.role as any, phone: form.phone || undefined });
      } else {
        const payload: any = { name: form.name, email: form.email, phone: form.phone || undefined };
        if (form.role !== editing.role) payload.role = form.role as any;
        await usersApi.update(editing.id, payload);
      }
      close();
      fetchUsers(page, q);
    } catch {
      alert("Error al guardar usuario");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    try {
      await usersApi.delete(id);
      fetchUsers(page, q);
    } catch {
      alert("Error al eliminar usuario");
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Usuarios</h1>
          <p className={styles.subtitle}>{total} usuario(s) en el sistema</p>
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
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o email…"
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}><table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Nombre</th>
              <th className={styles.thLeft}>Email</th>
              <th className={styles.thLeft}>Rol</th>
              <th className={styles.thRight}>Creado</th>
              <th className={styles.thAction}></th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id} className={`${styles.tr} ${loading ? styles.trDim : ""}`} onClick={() => openEdit(u)}>
                  <td className={styles.tdLeft}>
                    <div className={styles.userName}>
                      {u.name}
                      {u.id === currentUser?.id && <span className={styles.youBadge}>Tú</span>}
                    </div>
                  </td>
                  <td className={styles.tdLeft}>{u.email}</td>
                  <td className={styles.tdLeft}>
                    <span className={u.role === "admin" ? styles.roleAdmin : styles.roleCajero}>
                      {u.role === "admin" ? <Shield size={12} /> : <ShieldOff size={12} />}
                      {u.role === "admin" ? "Admin" : "Cajero"}
                    </span>
                  </td>
                  <td className={styles.tdRight}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className={styles.tdActions}>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(u); }} className={styles.iconBtn} title="Editar">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(u.id); }}
                      className={`${styles.iconBtn} ${styles.iconDanger}`}
                      title="Eliminar"
                      disabled={u.id === currentUser?.id}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : loading ? (
              <>
                <TableSkeleton cols={SKELETON_COLS} rows={5} />
              </>
            ) : (
              <tr><td colSpan={5} className={styles.empty}>Sin usuarios</td></tr>
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

      {editing && (
        <div className={styles.overlay} onClick={close}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editing === "new" ? "Nuevo usuario" : "Editar usuario"}
              </h2>
              <button onClick={close} className={styles.modalClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); save(); }} className={styles.modalForm}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nombre <span className={styles.required}>*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={styles.input} required />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email <span className={styles.required}>*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={styles.input} required />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  Contraseña {editing === "new" && <span className={styles.required}>*</span>}
                  {editing !== "new" && <span className={styles.optional}>(dejar vacío para mantener)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={styles.input}
                  required={editing === "new"}
                  minLength={editing === "new" ? 8 : undefined}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Rol</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={styles.select}>
                  <option value="cajero">Cajero</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Teléfono</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={styles.input} />
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
        title="Eliminar usuario"
        message="¿Estás seguro de que querés eliminar este usuario? Esta acción no se puede deshacer."
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
