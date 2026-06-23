import { useEffect, useState } from "react";
import { salesApi, type Sale, type SaleReport } from "@/api/sales";
import { money } from "@/lib/format";
import { cacheGet, cacheSet, cacheKey } from "@/lib/simple-cache";
import TableSkeleton from "@/components/TableSkeleton";
import styles from "./Reports.module.css";

type Range = "today" | "week" | "month";

function rangeStart(r: Range) {
  const d = new Date();
  if (r === "today") { d.setHours(0, 0, 0, 0); return d; }
  if (r === "week") { d.setDate(d.getDate() - 7); return d; }
  d.setDate(d.getDate() - 30);
  return d;
}

function rangeEnd(r: Range) {
  const d = new Date();
  if (r === "today") { d.setHours(23, 59, 59, 999); return d; }
  return d;
}

const SKELETON_COLS = [
  { width: "50%" },
  { width: "30%" },
  { width: "20%", align: "right" as const },
];

export default function Reports() {
  const [range, setRange] = useState<Range>("today");
  const [report, setReport] = useState<SaleReport | null>(() => {
    const cached = cacheGet<{ report: SaleReport; sales: Sale[] }>(cacheKey("reports", "today"));
    return cached?.report ?? null;
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const cached = cacheGet<{ report: SaleReport; sales: Sale[] }>(cacheKey("reports", "today"));
    return cached?.sales ?? [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = rangeStart(range).toISOString();
    const end = rangeEnd(range).toISOString();
    const key = cacheKey("reports", range);

    const cached = cacheGet<{ report: SaleReport; sales: Sale[] }>(key);
    if (cached) {
      setReport(cached.report);
      setSales(cached.sales);
    }

    setLoading(!cached);

    Promise.all([
      salesApi.report({ start_date: start, end_date: end }),
      salesApi.list({ start_date: start, end_date: end, limit: 20 }),
    ])
      .then(([r, list]) => {
        setReport(r);
        setSales(list.sales);
        cacheSet(key, { report: r, sales: list.sales });
      })
      .catch((err) => {
        console.error("Error al cargar reportes:", err);
      })
      .finally(() => setLoading(false));
  }, [range]);

  const hasData = report !== null;

  if (loading && !hasData) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.h1}>Reportes</h1>
            <p className={styles.subtitle}>Resumen de ventas y productos</p>
          </div>
          <div className={`${styles.select} ${styles.skeletonBar}`} style={{ width: 160, height: 40 }} />
        </header>
        <div className={styles.statsGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.skeletonBar} style={{ width: "40%", height: 12, marginBottom: 8 }} />
              <div className={styles.skeletonBar} style={{ width: "60%", height: 24 }} />
            </div>
          ))}
        </div>
        <div className={styles.twoCol}>
          <div className={styles.card}>
            <div className={styles.skeletonBar} style={{ width: "50%", height: 16, marginBottom: 16 }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonBar} style={{ width: "100%", height: 14, marginBottom: 8 }} />
            ))}
          </div>
          <div className={styles.card}>
            <div className={styles.skeletonBar} style={{ width: "50%", height: 16, marginBottom: 16 }} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonBar} style={{ width: `${50 + i * 8}%`, height: 14, marginBottom: 8 }} />
            ))}
          </div>
        </div>
        <div className={styles.recentCard}>
          <div className={styles.skeletonBar} style={{ width: "30%", height: 16, marginBottom: 16 }} />
          <table className={styles.table}>
            <thead><tr><th>Fecha</th><th>Método</th><th>Total</th></tr></thead>
            <tbody><TableSkeleton cols={SKELETON_COLS} rows={5} /></tbody>
          </table>
        </div>
      </div>
    );
  }

  const topProds = report?.top_products ?? [];
  const bm = report?.sales_by_payment_method ?? {};

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
        <Stat label="Ventas" value={money(report?.total_revenue ?? 0)} />
        <Stat label="Transacciones" value={String(report?.total_sales ?? 0)} />
        <Stat label="Ticket promedio" value={money(report?.average_ticket ?? 0)} />
        <Stat label="Efectivo" value={money(bm.efectivo ?? 0)} />
      </div>

      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Cierre de caja — {range === "today" ? "hoy" : range === "week" ? "7 días" : "30 días"}</h2>
          <div className={styles.rows}>
            <Row label="Efectivo" value={money(bm.efectivo ?? 0)} />
            <Row label="Tarjeta" value={money(bm.tarjeta ?? 0)} />
            <Row label="Transferencia" value={money(bm.transferencia ?? 0)} />
            <div className={styles.divider} />
            <Row label="Total" value={money(report?.total_revenue ?? 0)} bold />
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Productos más vendidos</h2>
          {topProds.length === 0 ? (
            <div className={styles.empty}>Sin datos en este período</div>
          ) : (
            <ul className={styles.topList}>
              {topProds.map((p) => (
                <li key={p.product_name} className={styles.topItem}>
                  <span className={styles.topName}>{p.product_name}</span>
                  <span className={styles.topStats}>{p.quantity} · {money(p.revenue)}</span>
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
            {sales.length > 0 ? (
              sales.map((s) => (
                <tr key={s.id} className={`${styles.tr} ${loading ? styles.trDim : ""}`}>
                  <td className={styles.tdDate}>{new Date(s.created_at).toLocaleString("es-MX")}</td>
                  <td className={styles.tdMethod}>{s.payment_method}</td>
                  <td className={styles.tdRight}>{money(s.total)}</td>
                </tr>
              ))
            ) : loading ? (
              <TableSkeleton cols={SKELETON_COLS} rows={5} />
            ) : (
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
