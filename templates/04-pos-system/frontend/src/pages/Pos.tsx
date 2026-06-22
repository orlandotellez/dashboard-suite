import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { productsApi, type Product } from "@/api/products";
import { salesApi, type CreateSalePayload } from "@/api/sales";
import { settingsApi } from "@/api/settings";
import { money } from "@/lib/format";
import styles from "./Pos.module.css";

type CartItem = Product & { quantity: number };

export default function Pos() {
  const scanRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [scan, setScan] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPct, setDiscountPct] = useState(0);
  const [payment, setPayment] = useState<string>("efectivo");
  const [received, setReceived] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeFooter, setStoreFooter] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Cargar productos del backend al montar
  useEffect(() => {
    productsApi.list({ active: true, limit: 500 })
      .then((res) => setProducts(res.products))
      .catch(() => {});

    settingsApi.get()
      .then((res) => {
        setStoreName(res.name);
        setStoreFooter(res.ticket_footer ?? "");
      })
      .catch(() => {});
  }, []);

  useEffect(() => { scanRef.current?.focus(); }, []);

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filtrar productos en vivo según el texto de búsqueda
  const searchResults = useMemo(() => {
    const term = scan.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((p) => p.active && (
        (p.barcode && p.barcode.toLowerCase().includes(term)) ||
        p.name.toLowerCase().includes(term)
      ))
      .slice(0, 15);
  }, [scan, products]);

  function addToCart(product: Product) {
    setCart((c) => {
      const i = c.findIndex((x) => x.id === product.id);
      if (i >= 0) {
        const copy = [...c];
        copy[i] = { ...copy[i], quantity: copy[i].quantity + 1 };
        return copy;
      }
      return [{ ...product, quantity: 1 }, ...c];
    });
    setScan("");
    setShowResults(false);
    scanRef.current?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = scan.trim();
    if (!term) return;

    // Si hay resultados visibles, agregar el primero
    if (searchResults.length > 0) {
      addToCart(searchResults[0]);
      return;
    }
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

  async function checkout() {
    if (!cart.length || checkingOut) return;
    setCheckingOut(true);

    try {
      const payload: CreateSalePayload = {
        subtotal: totals.subtotal,
        tax_total: totals.tax,
        discount: totals.discount,
        total: totals.total,
        payment_method: payment as "efectivo" | "tarjeta" | "transferencia",
        amount_received: payment === "efectivo" ? Number(received || 0) : undefined,
        change_given: payment === "efectivo" ? totals.change : undefined,
        items: cart.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          tax_rate: item.tax_rate,
          line_total: item.price * item.quantity,
        })),
      };

      const sale = await salesApi.create(payload);
      printTicket(sale.id, cart, totals, payment, received, storeName, storeFooter);
      setCart([]); setDiscountPct(0); setReceived(""); setPayment("efectivo");
    } catch (err) {
      console.error("Error al crear venta:", err);
      alert("Error al procesar la venta. Intenta de nuevo.");
    } finally {
      setCheckingOut(false);
      scanRef.current?.focus();
    }
  }

  return (
    <div className={styles.grid}>
      {/* left: scan + cart */}
      <div className={styles.leftPanel}>
        <div className={styles.searchBar} ref={searchWrapperRef}>
          <form onSubmit={handleSubmit}>
            <input
              ref={scanRef}
              value={scan}
              onChange={(e) => { setScan(e.target.value); setShowResults(true); }}
              onFocus={() => { if (scan.trim()) setShowResults(true); }}
              onKeyDown={(e) => { if (e.key === "Escape") setShowResults(false); }}
              placeholder="Escanea o escribe código / nombre"
              className={styles.searchInput}
              autoFocus
            />
          </form>
          {showResults && searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((p) => (
                <button key={p.id} className={styles.searchResultItem} onClick={() => addToCart(p)}>
                  <div className={styles.searchResultLeft}>
                    <span className={styles.searchResultName}>{p.name}</span>
                    {p.barcode && <span className={styles.searchResultCode}>{p.barcode}</span>}
                  </div>
                  <span className={styles.searchResultPrice}>{money(p.price)}</span>
                </button>
              ))}
            </div>
          )}
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

function printTicket(saleId: string, cart: Array<{ name: string; price: number; quantity: number }>, totals: any, payment: string, received: string, storeName: string, storeFooter: string) {
  const w = window.open("", "_blank", "width=320,height=600");
  if (!w) return;
  const date = new Date().toLocaleString("es-MX");
  const rows = cart.map((x) =>
    `<tr><td>${x.quantity}× ${x.name}</td><td style="text-align:right">${money(x.price * x.quantity)}</td></tr>`
  ).join("");
  w.document.write(`
    <html><head><title>Ticket</title>
    <style>body{font-family:ui-monospace,monospace;font-size:12px;padding:12px;max-width:300px}h2{font-size:14px;margin:0 0 4px;text-align:center}.m{color:#666;text-align:center;font-size:11px}table{width:100%;margin:12px 0;border-collapse:collapse}td{padding:2px 0;vertical-align:top}.line{border-top:1px dashed #999;margin:8px 0}.tot{display:flex;justify-content:space-between}.big{font-size:16px;font-weight:bold;margin:8px 0}</style></head><body>
    <h2>${storeName}</h2>
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
    <div class="m">${storeFooter || "¡Gracias por su compra!"}</div>
    <script>window.print();</script>
    </body></html>
  `);
  w.document.close();
}
