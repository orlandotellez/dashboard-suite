import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { getDemoStore } from "@/lib/demo-store";
import { money } from "@/lib/format";
import styles from "./Pos.module.css";

export default function Pos() {
  const navigate = useNavigate();
  const scanRef = useRef<HTMLInputElement>(null);
  const [scan, setScan] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPct, setDiscountPct] = useState(0);
  const [payment, setPayment] = useState<string>("efectivo");
  const [received, setReceived] = useState("");

  const store = useMemo(() => getDemoStore(), []);

  useEffect(() => { scanRef.current?.focus(); }, []);

  type Product = { id: string; name: string; barcode: string | null; price: number; tax_rate: number; stock: number };
  type CartItem = Product & { quantity: number };

  function findAndAdd(code: string) {
    const term = code.trim();
    if (!term) return;

    // Try exact barcode match first, then name search
    let found = store.products.find((p) => p.barcode === term && p.active);
    if (!found) {
      found = store.products.find((p) => p.name.toLowerCase().includes(term.toLowerCase()) && p.active);
    }
    if (!found) return;

    setCart((c) => {
      const i = c.findIndex((x) => x.id === found!.id);
      if (i >= 0) {
        const copy = [...c];
        copy[i] = { ...copy[i], quantity: copy[i].quantity + 1 };
        return copy;
      }
      return [{ ...(found as Product), quantity: 1 }, ...c];
    });
    setScan("");
    scanRef.current?.focus();
  }

  function setQty(id: string, q: number) {
    if (q <= 0) return setCart((c) => c.filter((x) => x.id !== id));
    setCart((c) => c.map((x) => (x.id === id ? { ...x, quantity: q } : x)));
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, x) => s + x.price * x.quantity, 0);
    const tax = cart.reduce((s, x) => s + x.price * x.quantity * (Number(x.tax_rate) / 100), 0);
    const discount = (subtotal + tax) * (discountPct / 100);
    const total = subtotal + tax - discount;
    const change = payment === "efectivo" && received ? Math.max(0, Number(received) - total) : 0;
    return { subtotal, tax, discount, total, change };
  }, [cart, discountPct, payment, received]);

  function checkout() {
    if (!cart.length) return;
    // Save to demo store
    const saleId = `demo-${Date.now().toString(36)}`;
    store.sales.push({
      id: saleId,
      cashier_id: store.user.id,
      subtotal: totals.subtotal,
      tax_total: totals.tax,
      discount: totals.discount,
      total: totals.total,
      payment_method: payment,
      amount_received: payment === "efectivo" ? Number(received || 0) : null,
      change_given: payment === "efectivo" ? totals.change : null,
      created_at: new Date().toISOString(),
    });
    for (const item of cart) {
      store.saleItems.push({
        id: `si-${Date.now().toString(36)}`, sale_id: saleId,
        product_id: item.id, product_name: item.name,
        quantity: item.quantity, unit_price: item.price,
        tax_rate: item.tax_rate, line_total: item.price * item.quantity,
        created_at: new Date().toISOString(),
      });
    }
    printTicket(saleId, cart, totals, payment, received);
    setCart([]); setDiscountPct(0); setReceived(""); setPayment("efectivo");
    scanRef.current?.focus();
  }

  return (
    <div className={styles.grid}>
      {/* left: scan + cart */}
      <div className={styles.leftPanel}>
        <div className={styles.searchBar}>
          <form onSubmit={(e) => { e.preventDefault(); findAndAdd(scan); }}>
            <input
              ref={scanRef}
              value={scan}
              onChange={(e) => setScan(e.target.value)}
              placeholder="Escanea o escribe código / nombre"
              className={styles.searchInput}
              autoFocus
            />
          </form>
        </div>

        <div className={styles.cartArea}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              Escanea un producto para empezar
            </div>
          ) : (
            <table className={styles.cartTable}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.thLeft}>Producto</th>
                  <th className={styles.thCenter}>Cantidad</th>
                  <th className={styles.thRight}>Precio</th>
                  <th className={styles.thRight}>Subtotal</th>
                  <th className={styles.thAction}></th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {cart.map((x) => (
                  <tr key={x.id}>
                    <td className={styles.tdProduct}>
                      <div className={styles.productName}>{x.name}</div>
                      <div className={styles.productBarcode}>{x.barcode}</div>
                    </td>
                    <td className={styles.tdQty}>
                      <div className={styles.qtyControls}>
                        <button onClick={() => setQty(x.id, x.quantity - 1)} className={styles.qtyBtn}>
                          <Minus size={14} />
                        </button>
                        <span className={styles.qtyValue}>{x.quantity}</span>
                        <button onClick={() => setQty(x.id, x.quantity + 1)} className={styles.qtyBtn}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className={styles.tdRight}>{money(x.price)}</td>
                    <td className={styles.tdRightBold}>{money(x.price * x.quantity)}</td>
                    <td className={styles.tdAction}>
                      <button onClick={() => setQty(x.id, 0)} className={styles.deleteBtn}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* right: totals + pay */}
      <div className={styles.rightPanel}>
        <div className={styles.totalsSection}>
          <Row label="Subtotal" value={money(totals.subtotal)} />
          <Row label="Impuestos" value={money(totals.tax)} />
          <div className={styles.discountRow}>
            <label className={styles.discountLabel}>Descuento %</label>
            <input
              type="number" min={0} max={100} value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
              className={styles.discountInput}
            />
          </div>
          <Row label="− Descuento" value={money(totals.discount)} />
        </div>

        <div className={styles.divider} />

        <div className={styles.totalRow}>
          <div className={styles.totalLabel}>Total</div>
          <div className={styles.totalValue}>{money(totals.total)}</div>
        </div>

        <div className={styles.paymentSection}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Método de pago</label>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className={styles.select}
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
          {payment === "efectivo" && (
            <>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Monto recibido</label>
                <input
                  type="number" min={0} value={received}
                  onChange={(e) => setReceived(e.target.value)}
                  className={`${styles.input} ${styles.inputRight}`}
                />
              </div>
              <div className={styles.changeRow}>
                <span className={styles.changeLabel}>Cambio</span>
                <span className={styles.changeValue}>{money(totals.change)}</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={checkout}
          disabled={cart.length === 0}
          className={styles.checkoutBtn}
        >
          Cobrar
        </button>
        {cart.length > 0 && (
          <button onClick={() => setCart([])} className={styles.clearCart}>
            <X size={12} /> Vaciar carrito
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}

function printTicket(saleId: string, cart: Array<{ name: string; price: number; quantity: number }>, totals: any, payment: string, received: string) {
  const store = getDemoStore();
  const w = window.open("", "_blank", "width=320,height=600");
  if (!w) return;
  const date = new Date().toLocaleString("es-MX");
  const rows = cart.map((x) =>
    `<tr><td>${x.quantity}× ${x.name}</td><td style="text-align:right">${money(x.price * x.quantity)}</td></tr>`
  ).join("");
  w.document.write(`
    <html><head><title>Ticket</title>
    <style>body{font-family:ui-monospace,monospace;font-size:12px;padding:12px;max-width:300px}h2{font-size:14px;margin:0 0 4px;text-align:center}.m{color:#666;text-align:center;font-size:11px}table{width:100%;margin:12px 0;border-collapse:collapse}td{padding:2px 0;vertical-align:top}.line{border-top:1px dashed #999;margin:8px 0}.tot{display:flex;justify-content:space-between}.big{font-size:16px;font-weight:bold;margin:8px 0}</style></head><body>
    <h2>${store.settings.name}</h2>
    <div class="m">${store.settings.address ?? ""}</div>
    <div class="m">${store.settings.phone ?? ""}</div>
    <div class="m">${date}</div>
    <div class="m">Ticket: ${saleId.slice(0, 8)}</div>
    <div class="line"></div>
    <table>${rows}</table>
    <div class="line"></div>
    <div class="tot"><span>Subtotal</span><span>${money(totals.subtotal)}</span></div>
    <div class="tot"><span>Impuestos</span><span>${money(totals.tax)}</span></div>
    <div class="tot"><span>Descuento</span><span>${money(totals.discount)}</span></div>
    <div class="big tot"><span>TOTAL</span><span>${money(totals.total)}</span></div>
    <div class="tot"><span>Pago (${payment})</span><span>${money(payment === "efectivo" ? Number(received || 0) : totals.total)}</span></div>
    ${payment === "efectivo" ? `<div class="tot"><span>Cambio</span><span>${money(totals.change)}</span></div>` : ""}
    <div class="line"></div>
    <div class="m">${store.settings.ticket_footer ?? "¡Gracias por su compra!"}</div>
    <script>window.print();</script>
    </body></html>
  `);
  w.document.close();
}
