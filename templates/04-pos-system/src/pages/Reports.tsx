import { useMemo, useState } from "react";
import { getDemoStore } from "@/lib/demo-store";
import { money } from "@/lib/format";
import styles from "./Reports.module.css";

type Range = "today" | "week" | "month";

function rangeStart(r: Range) {
  const d = new Date();
  if (r === "today") { d.setHours(0, 0, 0, 0); return d; }
  if (r === "week") { d.setDate(d.getDate() - 7); return d; }
  d.setDate(d.getDate() - 30);
  return d;
}

export default function Reports() {
  const store = useMemo(() => getDemoStore(), []);
  const [range, setRange] = useState<Range>("today");
  const since = useMemo(() => rangeStart(range).toISOString(), [range]);

  const sales = useMemo(
    () => store.sales.filter((s) => s.created_at >= since),
    [store.sales, since],
  );

  const items = useMemo(
    () => store.saleItems.filter((i) => i.created_at >= since),
    [store.saleItems, since],
  );

  const stats = useMemo(() => {
    const total = sales.reduce((s, x) => s + Number(x.total), 0);
    const count = sales.length;
    const avg = count ? total / count : 0;
    const byMethod = sales.reduce((acc: Record<string, number>, x) => {
      acc[x.payment_method] = (acc[x.payment_method] ?? 0) + Number(x.total);
      return acc;
    }, {});
    return { total, count, avg, byMethod };
  }, [sales]);

  const top = useMemo(() => {
    const m: Record<string, { qty: number; total: number }> = {};
    for (const it of items) {
      const k = it.product_name;
      m[k] = m[k] || { qty: 0, total: 0 };
      m[k].qty += it.quantity;
      m[k].total += Number(it.line_total);
    }
    return Object.entries(m).sort((a, b) => b[1].total - a[1].total).slice(0, 10);
  }, [items]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Reportes</h1>
          <p className={styles.subtitle}>Resumen de ventas y productos</p>
        </div>
        <select value={range} onChange={(e) => setRange(e.target.value as Range)} className={styles.select}>
          <option value="today">Hoy</option>
          <option value="week">Últimos 7 días</option>
          <option value="month">Últimos 30 días</option>
        </select>
      </header>

      <div className={styles.statsGrid}>
        <Stat label="Ventas" value={money(stats.total)} />
        <Stat label="Transacciones" value={String(stats.count)} />
        <Stat label="Ticket promedio" value={money(stats.avg)} />
        <Stat label="Efectivo" value={money(stats.byMethod.efectivo ?? 0)} />
      </div>

      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Cierre de caja — {range === "today" ? "hoy" : range === "week" ? "7 días" : "30 días"}</h2>
          <div className={styles.rows}>
            <Row label="Efectivo" value={money(stats.byMethod.efectivo ?? 0)} />
            <Row label="Tarjeta" value={money(stats.byMethod.tarjeta ?? 0)} />
            <Row label="Transferencia" value={money(stats.byMethod.transferencia ?? 0)} />
            <div className={styles.divider} />
            <Row label="Total" value={money(stats.total)} bold />
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Productos más vendidos</h2>
          {top.length === 0 ? (
            <div className={styles.empty}>Sin datos en este período</div>
          ) : (
            <ul className={styles.topList}>
              {top.map(([name, v]) => (
                <li key={name} className={styles.topItem}>
                  <span className={styles.topName}>{name}</span>
                  <span className={styles.topStats}>{v.qty} · {money(v.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={styles.recentCard}>
        <h2 className={styles.recentTitle}>Últimas ventas</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Fecha</th>
              <th className={styles.thLeft}>Método</th>
              <th className={styles.thRight}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.slice(0, 20).map((s) => (
              <tr key={s.id} className={styles.tr}>
                <td className={styles.tdDate}>{new Date(s.created_at).toLocaleString("es-MX")}</td>
                <td className={styles.tdMethod}>{s.payment_method}</td>
                <td className={styles.tdRight}>{money(s.total)}</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan={3} className={styles.empty}>Sin ventas</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={`${styles.rowValue} ${bold ? styles.rowBold : ""}`}>{value}</span>
    </div>
  );
}
