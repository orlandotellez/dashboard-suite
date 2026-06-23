import { useEffect, useState } from "react";
import { Search, Eye, X, ChevronLeft, ChevronRight, Printer } from "lucide-react";
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

  const LIMIT = 10;
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

      {/* ─── Detail Modal (ticket style) ─── */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Ticket de venta</h2>
              <div className={styles.modalHeaderActions}>
                <button onClick={() => printSaleTicket(selected, storeName)} className={styles.printBtn} title="Reimprimir">
                  <Printer size={16} /> Reimprimir
                </button>
                <button onClick={() => setSelected(null)} className={styles.modalClose}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={styles.ticket}>
              <div className={styles.ticketHeader}>
                <strong>{storeName || "Tienda"}</strong>
              </div>
              <div className={styles.ticketMeta}>
                <div>{new Date(selected.created_at).toLocaleString("es-MX")}</div>
                <div>Ticket: {selected.id.slice(0, 8)}</div>
              </div>
              <div className={styles.ticketDivider}></div>

              <table className={styles.ticketTable}>
                <tbody>
                  {(selected.items ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className={styles.ticketTdLeft}>
                        {item.quantity}× {item.product_name}
                      </td>
                      <td className={styles.ticketTdRight}>{money(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.ticketDivider}></div>

              <div className={styles.ticketRows}>
                <div className={styles.ticketRow}>
                  <span>Subtotal</span>
                  <span>{money(selected.subtotal)}</span>
                </div>
                {selected.tax_total > 0 && (
                  <div className={styles.ticketRow}>
                    <span>Impuestos</span>
                    <span>{money(selected.tax_total)}</span>
                  </div>
                )}
                {selected.discount > 0 && (
                  <div className={styles.ticketRow}>
                    <span>Descuento</span>
                    <span>−{money(selected.discount)}</span>
                  </div>
                )}
                <div className={`${styles.ticketRow} ${styles.ticketRowTotal}`}>
                  <span>TOTAL</span>
                  <span>{money(selected.total)}</span>
                </div>
                <div className={styles.ticketRow}>
                  <span>Pago ({selected.payment_method})</span>
                  <span>{money(selected.amount_received ?? selected.total)}</span>
                </div>
                {selected.change_given != null && selected.change_given > 0 && (
                  <div className={styles.ticketRow}>
                    <span>Cambio</span>
                    <span>{money(selected.change_given)}</span>
                  </div>
                )}
              </div>

              <div className={styles.ticketFooter}>
                ¡Gracias por su compra!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function printSaleTicket(sale: Sale, storeName: string) {
  const w = window.open("", "_blank", "width=320,height=600");
  if (!w) return;
  const date = new Date(sale.created_at).toLocaleString("es-MX");
  const rows = (sale.items ?? []).map((item) =>
    `<tr><td>${item.quantity}× ${item.product_name}</td><td style="text-align:right">${money(item.line_total)}</td></tr>`
  ).join("");
  w.document.write(`
    <html><head><title>Ticket</title>
    <style>body{font-family:ui-monospace,monospace;font-size:12px;padding:12px;max-width:300px}strong{font-size:14px;display:block;text-align:center;margin-bottom:4px}.m{color:#666;text-align:center;font-size:11px;margin-bottom:2px}table{width:100%;margin:12px 0;border-collapse:collapse}td{padding:2px 0;vertical-align:top}.line{border-top:1px dashed #999;margin:8px 0}.tot{display:flex;justify-content:space-between}.big{font-size:16px;font-weight:bold;margin:8px 0}.f{color:#666;text-align:center;font-size:11px;margin-top:12px}</style></head><body>
    <strong>${storeName}</strong>
    <div class="m">${date}</div>
    <div class="m">Ticket: ${sale.id.slice(0, 8)}</div>
    <div class="line"></div>
    <table>${rows}</table>
    <div class="line"></div>
    <div class="tot"><span>Subtotal</span><span>${money(sale.subtotal)}</span></div>
    ${sale.tax_total > 0 ? `<div class="tot"><span>Impuestos</span><span>${money(sale.tax_total)}</span></div>` : ""}
    ${sale.discount > 0 ? `<div class="tot"><span>Descuento</span><span>−${money(sale.discount)}</span></div>` : ""}
    <div class="big tot"><span>TOTAL</span><span>${money(sale.total)}</span></div>
    <div class="tot"><span>Pago (${sale.payment_method})</span><span>${money(sale.amount_received ?? sale.total)}</span></div>
    ${sale.change_given != null && sale.change_given > 0 ? `<div class="tot"><span>Cambio</span><span>${money(sale.change_given)}</span></div>` : ""}
    <div class="line"></div>
    <div class="f">¡Gracias por su compra!</div>
    <script>window.print();</script>
    </body></html>
  `);
  w.document.close();
}
