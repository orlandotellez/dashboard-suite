import { useMemo, useState } from "react";
import { getDemoStore } from "@/lib/demo-store";
import styles from "./Settings.module.css";

export default function Settings() {
  const store = useMemo(() => getDemoStore(), []);
  const [form, setForm] = useState({
    name: store.settings.name,
    address: store.settings.address ?? "",
    phone: store.settings.phone ?? "",
    tax_rate: store.settings.tax_rate.toString(),
    low_stock_threshold: store.settings.low_stock_threshold.toString(),
    ticket_footer: store.settings.ticket_footer ?? "",
  });

  function save(e: React.FormEvent) {
    e.preventDefault();
    store.settings.name = form.name;
    store.settings.address = form.address || null;
    store.settings.phone = form.phone || null;
    store.settings.tax_rate = Number(form.tax_rate);
    store.settings.low_stock_threshold = Number(form.low_stock_threshold);
    store.settings.ticket_footer = form.ticket_footer || null;
    store.settings.updated_at = new Date().toISOString();
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Ajustes</h1>
          <p className={styles.subtitle}>Datos del negocio y configuración general</p>
        </div>
      </header>

      <form onSubmit={save} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Nombre del negocio</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={styles.input} required />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Dirección</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={styles.input} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Teléfono</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={styles.input} />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>IVA por defecto %</label>
            <input type="number" step="0.01" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Stock mínimo por defecto</label>
            <input type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} className={styles.input} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Pie de página del ticket</label>
          <textarea
            rows={3}
            value={form.ticket_footer}
            onChange={(e) => setForm({ ...form, ticket_footer: e.target.value })}
            placeholder="¡Gracias por su compra!"
            className={styles.textarea}
          />
        </div>

        <button type="submit" className={styles.button}>Guardar cambios</button>
      </form>
    </div>
  );
}
