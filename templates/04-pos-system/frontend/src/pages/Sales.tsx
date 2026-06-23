import { useEffect, useState } from "react";
import { Search, Eye, X, ChevronLeft, ChevronRight, Store } from "lucide-react";
import { salesApi, type Sale } from "@/api/sales";
import { settingsApi } from "@/api/settings";
import { money } from "@/lib/format";
import styles from "./Sales.module.css";

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Sale | null>(null);
  const [storeName, setStoreName] = useState("");

  const LIMIT = 15;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    settingsApi.get().then((res) => setStoreName(res.name)).catch(() => {});
  }, []);

  const fetchSales = async (p: number) => {
    setLoading(true);
    try {
      const res = await salesApi.list({
        page: p,
        limit: LIMIT,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        payment_method: paymentFilter || undefined,
      });
      setSales(res.sales);
      setTotal(res.total);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(page);
  }, [page, paymentFilter]);

  function handleSearch() {
    setPage(1);
    fetchSales(1);
  }

  function openDetails(sale: Sale) {
    // If items are not loaded, fetch full sale
    if (!sale.items || sale.items.length === 0) {
      salesApi.getById(sale.id).then(setSelected).catch(() => {});
    } else {
      setSelected(sale);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Ventas</h1>
          <p className={styles.subtitle}>{total} venta(s) registradas</p>
        </div>
      </header>

      {/* ─── Filters ─── */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Desde</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Hasta</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Pago</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        <button onClick={handleSearch} className={styles.searchBtn}>
          <Search size={16} /> Buscar
        </button>
      </div>

      {/* ─── Table ─── */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Fecha</th>
              <th className={styles.thRight}>Artículos</th>
              <th className={styles.thRight}>Total</th>
              <th className={styles.thLeft}>Pago</th>
              <th className={styles.thAction}></th>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? (
              sales.map((s) => (
                <tr key={s.id} className={`${styles.tr} ${loading ? styles.trDim : ""}`}>
                  <td className={styles.tdLeft}>
                    <div className={styles.dateCell}>
                      {new Date(s.created_at).toLocaleDateString()}
                      <span className={styles.timeCell}>
                        {new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </td>
                  <td className={styles.tdRight}>{s.items?.length ?? "—"}</td>
                  <td className={styles.tdRight}>
                    <span className={styles.totalCell}>{money(s.total)}</span>
                  </td>
                  <td className={styles.tdLeft}>
                    <span className={`${styles.paymentBadge} ${styles[`payment_${s.payment_method}`] ?? ""}`}>
                      {s.payment_method}
                    </span>
                  </td>
                  <td className={styles.tdActions}>
                    <button onClick={() => openDetails(s)} className={styles.iconBtn} title="Ver detalle">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : loading ? (
              <tr><td colSpan={5} className={styles.empty}>Cargando…</td></tr>
            ) : (
              <tr><td colSpan={5} className={styles.empty}>Sin ventas</td></tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className={styles.pageBtn}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`${styles.pageBtn} ${n === page ? styles.pageActive : ""}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className={styles.pageBtn}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ─── Detail Modal ─── */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalle de venta</h2>
              <button onClick={() => setSelected(null)} className={styles.modalClose}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.invoice}>
              {/* Header */}
              <div className={styles.invoiceHeader}>
                <Store size={20} />
                <h3 className={styles.invoiceStore}>{storeName || "Tienda"}</h3>
              </div>
              <div className={styles.invoiceMeta}>
                <span>{new Date(selected.created_at).toLocaleString("es-MX")}</span>
                <span>Ticket: {selected.id.slice(0, 8)}</span>
              </div>

              <div className={styles.invoiceLine}></div>

              {/* Items */}
              <table className={styles.invoiceItems}>
                <thead>
                  <tr>
                    <th className={styles.invoiceThLeft}>Producto</th>
                    <th className={styles.invoiceThRight}>Cant</th>
                    <th className={styles.invoiceThRight}>Precio</th>
                    <th className={styles.invoiceThRight}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.items ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className={styles.invoiceTdLeft}>{item.product_name}</td>
                      <td className={styles.invoiceTdRight}>{item.quantity}</td>
                      <td className={styles.invoiceTdRight}>{money(item.unit_price)}</td>
                      <td className={styles.invoiceTdRight}>{money(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.invoiceLine}></div>

              {/* Totals */}
              <div className={styles.invoiceTotals}>
                <div className={styles.invoiceRow}>
                  <span>Subtotal</span>
                  <span>{money(selected.subtotal)}</span>
                </div>
                {selected.tax_total > 0 && (
                  <div className={styles.invoiceRow}>
                    <span>Impuestos</span>
                    <span>{money(selected.tax_total)}</span>
                  </div>
                )}
                {selected.discount > 0 && (
                  <div className={styles.invoiceRow}>
                    <span>Descuento</span>
                    <span>−{money(selected.discount)}</span>
                  </div>
                )}
                <div className={`${styles.invoiceRow} ${styles.invoiceTotalRow}`}>
                  <span>TOTAL</span>
                  <span>{money(selected.total)}</span>
                </div>
                <div className={styles.invoiceRow}>
                  <span>Pago ({selected.payment_method})</span>
                  <span>{money(selected.amount_received ?? selected.total)}</span>
                </div>
                {selected.change_given != null && selected.change_given > 0 && (
                  <div className={styles.invoiceRow}>
                    <span>Cambio</span>
                    <span>{money(selected.change_given)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
