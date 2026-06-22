import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/auth";
import styles from "./Auth.module.css";

export default function Auth() {
  const { login } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        await login(email, password);
      } else {
        await authApi.register({ name, email, password });
        await login(email, password);
      }
    } catch (err: any) {
      setError(err?.message ?? "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Caja</h1>
          <p className={styles.subtitle}>Punto de venta e inventario</p>
        </div>
        <form onSubmit={submit} className={styles.form}>
          {mode === "signup" && (
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>Nombre</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.input}
              />
            </div>
          )}
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
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "..." : mode === "signin" ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className={styles.toggle}
        >
          {mode === "signin" ? "¿No tienes cuenta? Crear una" : "Ya tengo cuenta"}
        </button>
      </div>
    </div>
  );
}
