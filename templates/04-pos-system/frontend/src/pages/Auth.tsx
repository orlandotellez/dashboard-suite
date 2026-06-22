import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Demo mode: just navigate to POS
    setLoading(true);
    setTimeout(() => {
      navigate("/pos");
    }, 300);
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Caja</h1>
          <p className={styles.subtitle}>Punto de venta e inventario</p>
        </div>
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
        <p className={styles.hint}>
          La primera cuenta creada será el administrador.
        </p>
      </div>
    </div>
  );
}
