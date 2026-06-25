import React, { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Trash2, X, ScanBarcode, Wrench, PackagePlus, CheckCircle } from "lucide-react";
import { productsApi, type Product } from "@/api/products";
import { servicesApi, type Service } from "@/api/services";
import { salesApi, type CreateSalePayload } from "@/api/sales";
import { settingsApi } from "@/api/settings";
import { usePosStore, type CartItem, type ProductCartItem, type ServiceCartItem } from "@/store/posStore";
import { money } from "@/lib/format";
import styles from "./Pos.module.css";

export default function Pos() {
  const scanRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [scan, setScan] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeFooter, setStoreFooter] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [addingToService, setAddingToService] = useState<string | null>(null);
  const [serviceProductSearch, setServiceProductSearch] = useState("");
  const [completedSale, setCompletedSale] = useState<{
    saleId: string;
    cart: CartItem[];
    totals: { subtotal: number; tax: number; discount: number; total: number; change: number };
    payment: string;
    received: string;
    discountPct: number;
  } | null>(null);

  const updateServiceProductQty = usePosStore((s) => s.updateServiceProductQty);
  const removeServiceProduct = usePosStore((s) => s.removeServiceProduct);
  const addServiceProduct = usePosStore((s) => s.addServiceProduct);
  const toggleServiceProductAffectsPrice = usePosStore((s) => s.toggleServiceProductAffectsPrice);

  const cart = usePosStore((s) => s.cart);
  const discountPct = usePosStore((s) => s.discountPct);
  const payment = usePosStore((s) => s.payment);
  const received = usePosStore((s) => s.received);
  const manualAmount = usePosStore((s) => s.manualAmount);
  const checkingOut = usePosStore((s) => s.checkingOut);
  const setQty = usePosStore((s) => s.setQty);
  const clearCart = usePosStore((s) => s.clearCart);
  const setDiscountPct = usePosStore((s) => s.setDiscountPct);
  const setPayment = usePosStore((s) => s.setPayment);
  const setReceived = usePosStore((s) => s.setReceived);
  const setManualAmount = usePosStore((s) => s.setManualAmount);
  const setCheckingOut = usePosStore((s) => s.setCheckingOut);

  useEffect(() => {
    productsApi.list({ active: true, limit: 100 })
      .then((res) => setProducts(res.products))
      .catch(() => { });

    servicesApi.list({ active: true, limit: 100 })
      .then((res) => setServices(res.services))
      .catch(() => { });

    settingsApi.get()
      .then((res) => {
        setStoreName(res.name);
        setStoreAddress(res.address ?? "");
        setStorePhone(res.phone ?? "");
        setStoreFooter(res.ticket_footer ?? "");
      })
      .catch(() => { });
  }, []);

  useEffect(() => { scanRef.current?.focus(); }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  interface SearchResult {
    _type: "product" | "service";
    id: string;
    name: string;
    barcode?: string;
    price: number;
    data: Product | Service;
  }

  const searchResults = useMemo(() => {
    const term = scan.trim().toLowerCase();
    if (!term) return [];
    const results: SearchResult[] = [];

    // Products
    for (const p of products) {
      if (!p.active) continue;
      if (
        (p.barcode && p.barcode.toLowerCase().includes(term)) ||
        p.name.toLowerCase().includes(term)
      ) {
        results.push({ _type: "product", id: p.id, name: p.name, barcode: p.barcode, price: p.price, data: p });
        if (results.length >= 15) break;
      }
    }

    // Services (only if products didn't fill all slots)
    if (results.length < 15) {
      for (const s of services) {
        if (!s.is_active) continue;
        if (s.name.toLowerCase().includes(term)) {
          results.push({ _type: "service", id: s.id, name: s.name, barcode: undefined, price: s.base_price, data: s });
          if (results.length >= 15) break;
        }
      }
    }

    return results;
  }, [scan, products, services]);

  function addToCart(result: SearchResult) {
    if (result._type === "product") {
      const product = result.data as Product;
      // Stock validation
      if (product.stock <= 0) {
        alert(`"${product.name}" no tiene stock disponible`);
        return;
      }
      // Check if already in cart — validate combined qty doesn't exceed stock
      const inCart = cart.find((x) => x._type === "product" && x.id === product.id) as ProductCartItem | undefined;
      const newTotalQty = (inCart?.quantity ?? 0) + 1;
      if (newTotalQty > product.stock) {
        alert(`Stock insuficiente para "${product.name}": disponible ${product.stock}, ya tienes ${inCart?.quantity ?? 0} en el carrito`);
        return;
      }
      if (product.stock <= product.low_stock_threshold) {
        const ok = confirm(`"${product.name}" tiene stock bajo (${product.stock} unidades). ¿Agregar al carrito de todas formas?`);
        if (!ok) return;
      }
      usePosStore.getState().addToCart(product);
    } else {
      const service = result.data as Service;
      usePosStore.getState().addToCart({
        id: service.id,
        service_id: service.id,
        name: service.name,
        base_price: service.base_price,
        products: service.products,
      });
    }
    setScan("");
    setShowResults(false);
    scanRef.current?.focus();
  }

  function handleSetQty(item: CartItem, newQty: number) {
    // For products, validate stock when increasing quantity
    if (item._type === "product" && newQty > item.quantity) {
      const prod = item as ProductCartItem;
      if (prod.stock <= 0) {
        alert(`"${prod.name}" no tiene stock disponible`);
        return;
      }
      if (newQty > prod.stock) {
        alert(`Stock insuficiente para "${prod.name}": disponible ${prod.stock}, solicitado ${newQty}`);
        return;
      }
    }
    setQty(item.id, newQty);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = scan.trim();
    if (!term) return;

    if (searchResults.length > 0) {
      addToCart(searchResults[0]);
      return;
    }
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, x) => {
      if (x._type === "product") return s + x.price * x.quantity;
      // Service: base price + products that affect price (× service qty)
      const svc = x as ServiceCartItem;
      const additivePerInstance = svc.products
        .filter((sp) => sp.affects_price)
        .reduce((sum, sp) => sum + sp.unit_price * sp.quantity, 0);
      return s + (svc.base_price + additivePerInstance) * svc.quantity;
    }, 0);
    const tax = 0;
    const discount = subtotal * (discountPct / 100);
    const total = subtotal - discount;
    const change = (payment === "efectivo" || manualAmount) && received ? Math.max(0, Number(received) - total) : 0;
    return { subtotal, tax, discount, total, change };
  }, [cart, discountPct, payment, received]);

  async function checkout() {
    if (!cart.length || checkingOut) return;

    if ((payment === "efectivo" || manualAmount) && Number(received || 0) < totals.total) {
      alert(`El monto recibido ($${money(Number(received || 0))}) es menor al total ($${money(totals.total)}).`);
      setCheckingOut(false);
      return;
    }

    setCheckingOut(true);

    try {
      const items = cart
        .filter((x): x is ProductCartItem => x._type === "product")
        .map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          tax_rate: 0,
          line_total: item.price * item.quantity,
        }));

      const serviceItems = cart
        .filter((x): x is ServiceCartItem => x._type === "service")
        .map((item) => {
          const svcQty = item.quantity;
          const customProducts = item.products.map((sp) => ({
            product_id: sp.product_id,
            product_name: sp.product_name,
            quantity: sp.quantity * svcQty, // multiplicar por la cantidad de servicios
            unit_price: sp.unit_price,
            line_total: sp.unit_price * sp.quantity * svcQty,
            affects_price: sp.affects_price,
          }));
          const additiveTotal = customProducts
            .filter((p) => p.affects_price)
            .reduce((s, p) => s + p.line_total, 0);
          return {
            service_id: item.service_id,
            service_name: item.name,
            base_price: item.base_price,
            line_total: item.base_price * svcQty + additiveTotal,
            products: customProducts,
          };
        });

      const shouldSendAmount = payment === "efectivo" || manualAmount;

      const payload: CreateSalePayload = {
        subtotal: totals.subtotal,
        tax_total: 0,
        discount: totals.discount,
        total: totals.total,
        payment_method: payment as "efectivo" | "tarjeta" | "transferencia" | "credito",
        amount_received: shouldSendAmount ? Number(received || 0) : undefined,
        change_given: shouldSendAmount ? totals.change : undefined,
        items: items.length > 0 ? items : undefined,
        service_items: serviceItems.length > 0 ? serviceItems : undefined,
      };

      const sale = await salesApi.create(payload);
      setCompletedSale({
        saleId: sale.id,
        cart: [...cart],
        totals: { ...totals },
        payment,
        received,
        discountPct,
      });
    } catch (err) {
      console.error("Error al crear venta:", err);
      alert("Error al procesar la venta. Intenta de nuevo.");
      setCheckingOut(false);
    }
  }

  function handlePrintTicket(saleId: string) {
    if (!completedSale) return;
    printTicket(saleId, completedSale.cart, completedSale.totals, completedSale.payment, completedSale.received, storeName, storeAddress, storePhone, storeFooter, completedSale.discountPct);
    finalizeSale();
  }

  function finalizeSale() {
    setCompletedSale(null);
    clearCart();
    setCheckingOut(false);
    scanRef.current?.focus();
  }

  function getItemPrice(item: CartItem): number {
    if (item._type === "product") return item.price;
    const svc = item as ServiceCartItem;
    const additivePerInstance = svc.products
      .filter((sp) => sp.affects_price)
      .reduce((sum, sp) => sum + sp.unit_price * sp.quantity, 0);
    return svc.base_price + additivePerInstance;
  }

  function getItemSubtotal(item: CartItem): number {
    return getItemPrice(item) * item.quantity;
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
              {searchResults.map((r) => {
                const isOutOfStock = r._type === "product" && (r.data as Product).stock <= 0;
                const isLowStock = r._type === "product" && (r.data as Product).stock > 0 && (r.data as Product).stock <= (r.data as Product).low_stock_threshold;
                return (
                  <button
                    key={`${r._type}-${r.id}`}
                    className={`${styles.searchResultItem} ${isOutOfStock ? styles.searchResultItemDisabled : ""}`}
                    onClick={() => !isOutOfStock && addToCart(r)}
                    disabled={isOutOfStock}
                  >
                    <div className={styles.searchResultLeft}>
                      <span className={styles.searchResultName}>
                        {r._type === "service" && <Wrench size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle", opacity: 0.6 }} />}
                        {r.name}
                      </span>
                      {r.barcode && <span className={styles.searchResultCode}>{r.barcode}</span>}
                      {r._type === "product" && isOutOfStock && <span className={styles.searchResultCode}>Sin stock</span>}
                      {r._type === "product" && isLowStock && <span className={styles.searchResultCodeLowStock}>Stock bajo</span>}
                      {r._type === "service" && <span className={styles.searchResultCode}>Servicio</span>}
                    </div>
                    <span className={styles.searchResultPrice}>{money(r.price)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.cartArea}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <ScanBarcode size={40} className={styles.emptyCartIcon} />
              <span>Escanea un producto o busca un servicio</span>
            </div>
          ) : (
            <table className={styles.cartTable}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.thLeft}>Producto / Servicio</th>
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
                      <div className={styles.productName}>
                        {x._type === "service" && <Wrench size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle", opacity: 0.5 }} />}
                        {x.name}
                      </div>
                      {x._type === "product" && (x as ProductCartItem).barcode && (
                        <div className={styles.productBarcode}>{(x as ProductCartItem).barcode}</div>
                      )}
                      {x._type === "service" && (
                        <div className={styles.serviceProducts}>
                          <div className={styles.serviceBasePrice}>Base: {money((x as ServiceCartItem).base_price)}</div>
                          {(x as ServiceCartItem).products.map((sp) => (
                            <div key={sp.product_id} className={styles.serviceProductItem}>
                              <span className={styles.spName}>{sp.product_name}</span>
                              <div className={styles.spControls}>
                                <button
                                  onClick={() => toggleServiceProductAffectsPrice((x as ServiceCartItem).service_id, sp.product_id)}
                                  className={`${styles.spPriceToggle} ${sp.affects_price ? styles.spPriceToggleOn : ""}`}
                                  title={sp.affects_price ? "Suma al precio" : "No suma al precio"}
                                >
                                  $
                                </button>
                                <button
                                  onClick={() => updateServiceProductQty((x as ServiceCartItem).service_id, sp.product_id, sp.quantity - 1)}
                                  className={styles.spQtyBtn}
                                  title="Quitar uno"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className={styles.spQty}>{sp.quantity}</span>
                                <button
                                  onClick={() => updateServiceProductQty((x as ServiceCartItem).service_id, sp.product_id, sp.quantity + 1)}
                                  className={styles.spQtyBtn}
                                  title="Agregar uno"
                                >
                                  <Plus size={10} />
                                </button>
                                <button
                                  onClick={() => removeServiceProduct((x as ServiceCartItem).service_id, sp.product_id)}
                                  className={styles.spRemoveBtn}
                                  title="Quitar producto"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className={styles.serviceProductAdd}>
                            {addingToService === (x as ServiceCartItem).service_id ? (
                              <div className={styles.spAddPopover}>
                                <input
                                  value={serviceProductSearch}
                                  onChange={(e) => setServiceProductSearch(e.target.value)}
                                  placeholder="Buscar producto..."
                                  className={styles.spAddInput}
                                  autoFocus
                                />
                                <div className={styles.spAddResults}>
                                  {products
                                    .filter(
                                      (p) =>
                                        p.active &&
                                        !(x as ServiceCartItem).products.find((sp) => sp.product_id === p.id) &&
                                        (serviceProductSearch === "" ||
                                          p.name.toLowerCase().includes(serviceProductSearch.toLowerCase()))
                                    )
                                    .slice(0, 8)
                                    .map((p) => (
                                      <button
                                        key={p.id}
                                        type="button"
                                        className={styles.spAddResultItem}
                                        onClick={() => {
                                          if (p.stock <= 0) {
                                            alert(`"${p.name}" no tiene stock disponible`);
                                            return;
                                          }
                                          addServiceProduct((x as ServiceCartItem).service_id, p, 1);
                                          setServiceProductSearch("");
                                          setAddingToService(null);
                                        }}
                                      >
                                        {p.name}
                                      </button>
                                    ))}
                                  {products.filter(
                                    (p) =>
                                      p.active &&
                                      !(x as ServiceCartItem).products.find((sp) => sp.product_id === p.id) &&
                                      (serviceProductSearch === "" ||
                                        p.name.toLowerCase().includes(serviceProductSearch.toLowerCase()))
                                  ).length === 0 && (
                                      <div className={styles.spAddEmpty}>Sin resultados</div>
                                    )}
                                </div>
                                <button
                                  type="button"
                                  className={styles.spAddCancel}
                                  onClick={() => { setAddingToService(null); setServiceProductSearch(""); }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className={styles.spAddBtn}
                                onClick={() => setAddingToService((x as ServiceCartItem).service_id)}
                              >
                                <PackagePlus size={12} /> Agregar producto
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className={styles.tdQty}>
                      <div className={styles.qtyControls}>
                        <button onClick={() => handleSetQty(x, x.quantity - 1)} className={styles.qtyBtn}>
                          <Minus size={14} />
                        </button>
                        <span className={styles.qtyValue}>{x.quantity}</span>
                        <button onClick={() => handleSetQty(x, x.quantity + 1)} className={styles.qtyBtn}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className={styles.tdRight}>{money(getItemPrice(x))}</td>
                    <td className={styles.tdRightBold}>{money(getItemSubtotal(x))}</td>
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
          {totals.tax > 0 && <Row label="Impuestos" value={money(totals.tax)} />}
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
              <option value="credito">Crédito</option>
            </select>
          </div>
          {payment !== "credito" && (
            <>
              {payment === "tarjeta" || payment === "transferencia"
                ? (
                  <label className={styles.manualAmountLabel}>
                    <input
                      type="checkbox"
                      checked={manualAmount}
                      onChange={(e) => setManualAmount(e.target.checked)}
                      className={styles.manualAmountCheckbox}
                    />
                    Adjuntar monto manualmente
                  </label>
                )
                : null}
              {(payment === "efectivo" || manualAmount) && (
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
                    <span className={`${styles.changeValue} ${received && Number(received) < totals.total ? styles.changeNegative : ""}`}>
                      {received && Number(received) < totals.total
                        ? `−$${money(totals.total - Number(received))}`
                        : money(totals.change)
                      }
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <button
          onClick={checkout}
          disabled={cart.length === 0 || checkingOut || ((payment === "efectivo" || manualAmount) && received !== "" && Number(received || 0) < totals.total)}
          className={styles.checkoutBtn}
        >
          {checkingOut ? "Procesando venta..." : "Cobrar"}
        </button>
        {cart.length > 0 && (
          <button onClick={clearCart} className={styles.clearCart}>
            <X size={12} /> Vaciar carrito
          </button>
        )}
      </div>

      {/* Sale completion modal */}
      {completedSale && (
        <div className={styles.completedOverlay} onClick={() => { }}>
          <div className={styles.completedModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.completedHeader}>
              <div className={styles.completedIcon}>
                <CheckCircle />
              </div>
              <h2 className={styles.completedTitle}>Venta realizada exitosamente</h2>
            </div>

            <div className={styles.completedTicket}>
              <div className={styles.completedStoreName}>{storeName}</div>
              {storeAddress && <div className={styles.completedAddress}>{storeAddress}</div>}
              {storePhone && <div className={styles.completedPhone}>{storePhone}</div>}
              <div className={styles.completedDate}>{new Date().toLocaleString("es-MX")}</div>
              <div className={styles.completedTicketId}>Ticket: {completedSale.saleId.slice(0, 8)}</div>

              <div className={styles.completedDivider} />

              <table className={styles.completedTable}>
                <tbody>
                  {completedSale.cart.map((x) => {
                    if (x._type === "product") {
                      const prod = x as ProductCartItem;
                      return (
                        <tr key={x.id}>
                          <td className={styles.ctdLeft}>{x.quantity}× {x.name}</td>
                          <td className={styles.ctdRight}>{money(prod.price * x.quantity)}</td>
                        </tr>
                      );
                    }
                    const svc = x as ServiceCartItem;
                    const svcQty = svc.quantity;
                    const baseTotal = svc.base_price * svcQty;
                    const additivePerInstance = svc.products
                      .filter((sp) => sp.affects_price)
                      .reduce((s, sp) => s + sp.unit_price * sp.quantity, 0);
                    const additiveTotal = additivePerInstance * svcQty;
                    return (
                      <React.Fragment key={x.id}>
                        <tr>
                          <td className={styles.ctdLeft}>{svcQty}× {svc.name}</td>
                          <td className={styles.ctdRight}>{money(baseTotal)}</td>
                        </tr>
                        {svc.products
                          .filter((sp) => sp.quantity > 0 && !sp.affects_price)
                          .map((sp) => (
                            <tr key={`${x.id}-inc-${sp.product_id}`}>
                              <td className={styles.ctdSub} colSpan={2}>{sp.product_name} × {sp.quantity * svcQty}</td>
                            </tr>
                          ))}
                        {svc.products
                          .filter((sp) => sp.quantity > 0 && sp.affects_price)
                          .map((sp) => (
                            <tr key={`${x.id}-add-${sp.product_id}`}>
                              <td className={styles.ctdSub}>+ {sp.product_name} × {sp.quantity * svcQty}</td>
                              <td className={styles.ctdRightSub}>{money(sp.unit_price * sp.quantity * svcQty)}</td>
                            </tr>
                          ))}
                        {additiveTotal > 0 && (
                          <tr key={`${x.id}-total`}>
                            <td className={styles.ctdTotalLine}>Total servicio</td>
                            <td className={styles.ctdRightTotalLine}>{money(baseTotal + additiveTotal)}</td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              <div className={styles.completedDivider} />

              <div className={styles.ctotRow}>
                <span>Subtotal</span>
                <span>{money(completedSale.totals.subtotal)}</span>
              </div>
              {completedSale.discountPct > 0 && (
                <div className={styles.ctotRow}>
                  <span>Descuento ({completedSale.discountPct}%)</span>
                  <span>−{money(completedSale.totals.discount)}</span>
                </div>
              )}
              <div className={`${styles.ctotRow} ${styles.ctotTotal}`}>
                <span>TOTAL</span>
                <span>{money(completedSale.totals.total)}</span>
              </div>
              {(completedSale.payment === "efectivo" || completedSale.received) && (
                <React.Fragment>
                  <div className={styles.ctotRow}>
                    <span>Pago ({completedSale.payment})</span>
                    <span>{money(Number(completedSale.received || 0))}</span>
                  </div>
                  {completedSale.totals.change > 0 && (
                    <div className={styles.ctotRow}>
                      <span>Cambio</span>
                      <span>{money(completedSale.totals.change)}</span>
                    </div>
                  )}
                </React.Fragment>
              )}
            </div>

            <div className={styles.completedActions}>
              <button
                onClick={() => handlePrintTicket(completedSale.saleId)}
                className={styles.completedPrintBtn}
                autoFocus
              >
                Imprimir
              </button>
              <button
                onClick={finalizeSale}
                className={styles.completedCloseBtn}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
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

function printTicket(
  saleId: string,
  cart: CartItem[],
  totals: any,
  payment: string,
  received: string,
  storeName: string,
  storeAddress: string,
  storePhone: string,
  storeFooter: string,
  discountPct: number
) {
  const w = window.open("", "_blank", "width=320,height=600");
  if (!w) return;
  const date = new Date().toLocaleString("es-MX");
  const rows = cart.map((x) => {
    if (x._type === "product") {
      const lineTotal = (x as ProductCartItem).price * x.quantity;
      return `<tr><td>${x.quantity}× ${x.name}</td><td style="text-align:right">${money(lineTotal)}</td></tr>`;
    }
    const svc = x as ServiceCartItem;
    const svcQty = svc.quantity;
    const baseTotal = svc.base_price * svcQty;
    const additivePerInstance = svc.products
      .filter((sp) => sp.affects_price)
      .reduce((s, sp) => s + sp.unit_price * sp.quantity, 0);
    const additiveTotal = additivePerInstance * svcQty;
    const lineTotal = baseTotal + additiveTotal;

    // Rows for each additive product
    const additiveRows = svc.products
      .filter((sp) => sp.affects_price && sp.quantity > 0)
      .map((sp) => {
        const totalQty = sp.quantity * svcQty;
        const spTotal = sp.unit_price * totalQty;
        return `<tr><td style="padding-left:8px;font-size:10px">+ ${sp.product_name} × ${totalQty}</td><td style="text-align:right;font-size:10px">${money(spTotal)}</td></tr>`;
      })
      .join("");

    // Included products text (comma-separated, no prices)
    const included = svc.products
      .filter((sp) => !sp.affects_price && sp.quantity > 0)
      .map((sp) => `${sp.product_name} × ${sp.quantity * svcQty}`)
      .join(", ");

    const includedRow = included
      ? `<tr><td style="padding-left:8px;font-size:10px;color:#888" colspan="2">Incluye: ${included}</td></tr>`
      : "";

    return `<tr><td>${svcQty}× ${svc.name}</td><td style="text-align:right">${money(baseTotal)}</td></tr>${includedRow}${additiveRows}<tr><td style="padding-left:8px;font-size:10px;border-top:1px dashed #ccc">Total servicio</td><td style="text-align:right;font-size:10px;border-top:1px dashed #ccc">${money(lineTotal)}</td></tr>`;
  }).join("");
  w.document.write(`
    <html><head><title>Ticket</title>
    <style>body{font-family:ui-monospace,monospace;font-size:12px;padding:12px;max-width:300px}h2{font-size:14px;margin:0 0 4px;text-align:center}.m{color:#666;text-align:center;font-size:11px}table{width:100%;margin:12px 0;border-collapse:collapse}td{padding:2px 0;vertical-align:top}.line{border-top:1px dashed #999;margin:8px 0}.tot{display:flex;justify-content:space-between}.big{font-size:16px;font-weight:bold;margin:8px 0}</style></head><body>
    <h2>${storeName}</h2>
    ${storeAddress ? `<div class="m">${storeAddress}</div>` : ""}
    ${storePhone ? `<div class="m">${storePhone}</div>` : ""}
    <div class="m">${date}</div>
    <div class="m">Ticket: ${saleId.slice(0, 8)}</div>
    <div class="line"></div>
    <table>${rows}</table>
    <div class="line"></div>
    <div class="tot"><span>Subtotal</span><span>${money(totals.subtotal)}</span></div>
    ${totals.tax > 0 ? `<div class="tot"><span>Impuestos</span><span>${money(totals.tax)}</span></div>` : ""}
    ${discountPct > 0 ? `<div class="tot"><span>Descuento (${discountPct}%)</span><span>−${money(totals.discount)}</span></div>` : `<div class="tot"><span>Descuento</span><span>${money(totals.discount)}</span></div>`}
    <div class="big tot"><span>TOTAL</span><span>${money(totals.total)}</span></div>
    <div class="tot"><span>Pago (${payment})</span><span>${money(payment === "efectivo" || received ? Number(received || 0) : totals.total)}</span></div>
    ${payment === "efectivo" || received ? `<div class="tot"><span>Cambio</span><span>${money(totals.change)}</span></div>` : ""}
    <div class="line"></div>
    <div class="m">${storeFooter || "¡Gracias por su compra!"}</div>
    <script>window.print();</script>
    </body></html>
  `);
  w.document.close();
}
