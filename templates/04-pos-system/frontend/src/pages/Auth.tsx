import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Store, ShoppingCart, Package, BarChart3, Shield } from "lucide-react";
import styles from "./Auth.module.css";

export default function Auth() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message ?? "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* ─── Left panel: branding ─── */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.logo}>
            <Store size={32} />
          </div>
          <h1 className={styles.brandTitle}>Caja</h1>
          <p className={styles.brandSubtitle}>Sistema de Punto de Venta e Inventario</p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <ShoppingCart size={18} />
              <span>Ventas rápidas con escáner y búsqueda</span>
            </div>
            <div className={styles.feature}>
              <Package size={18} />
              <span>Gestión de productos y categorías</span>
            </div>
            <div className={styles.feature}>
              <BarChart3 size={18} />
              <span>Reportes de ventas e inventario</span>
            </div>
            <div className={styles.feature}>
              <Shield size={18} />
              <span>Control de acceso por roles</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right panel: form ─── */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Iniciar sesión</h2>
          <p className={styles.formSubtitle}>Ingresá tus credenciales para acceder</p>

          <form onSubmit={submit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Correo</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                placeholder="admin@ejemplo.com"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="••••••••"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
