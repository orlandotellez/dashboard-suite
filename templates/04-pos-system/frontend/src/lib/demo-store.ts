// Demo store — datos en memoria para mostrar la app sin backend

export type DemoUser = {
  id: string;
  email: string;
  role: "admin" | "cajero";
};

export type DemoProduct = {
  id: string;
  barcode: string | null;
  name: string;
  category: string | null;
  price: number;
  cost: number;
  tax_rate: number;
  stock: number;
  low_stock_threshold: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type DemoSale = {
  id: string;
  cashier_id: string;
  subtotal: number;
  tax_total: number;
  discount: number;
  total: number;
  payment_method: string;
  amount_received: number | null;
  change_given: number | null;
  created_at: string;
};

export type DemoSaleItem = {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
  created_at: string;
};

export type DemoInventoryMovement = {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  note: string | null;
  user_id: string;
  created_at: string;
};

export type DemoSettings = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  tax_rate: number;
  low_stock_threshold: number;
  ticket_footer: string | null;
  updated_at: string;
};

const DEMO_USER_ID = "demo-user-0000-0000-000000000001";

let nextId = 100;
function genId() {
  return `demo-${nextId++}-${Date.now().toString(36)}`;
}

class DemoStore {
  user: DemoUser = {
    id: DEMO_USER_ID,
    email: "admin@smart-miscelanea.com",
    role: "admin",
  };

  products: DemoProduct[] = [];
  sales: DemoSale[] = [];
  saleItems: DemoSaleItem[] = [];
  movements: DemoInventoryMovement[] = [];

  settings: DemoSettings = {
    id: 1,
    name: "Miscelánea Doña Mary",
    address: "Av. Siempre Viva 123, Col. Centro",
    phone: "55-1234-5678",
    tax_rate: 16,
    low_stock_threshold: 5,
    ticket_footer: "¡Gracias por su compra, vuelva pronto!",
    updated_at: new Date().toISOString(),
  };

  constructor() {
    this.seedProducts();
    this.seedSales();
  }

  private seedProducts() {
    const now = new Date("2026-06-21T10:00:00Z").toISOString();
    const items = [
      { name: "Sabritas Adobadas 45g", category: "Botanas", price: 18, cost: 13, barcode: "7501000111123", stock: 45 },
      { name: "Sabritas Original 45g", category: "Botanas", price: 18, cost: 13, barcode: "7501000111130", stock: 30 },
      { name: "Doritos Nacho 60g", category: "Botanas", price: 20, cost: 14.5, barcode: "7501000112144", stock: 25 },
      { name: "Cacahuates Japoneses 80g", category: "Botanas", price: 12, cost: 8, barcode: "7501000113151", stock: 60 },
      { name: "Churritos 90g", category: "Botanas", price: 15, cost: 10, barcode: "7501000114162", stock: 20 },
      { name: "Coca-Cola 600ml", category: "Refrescos", price: 25, cost: 18, barcode: "7501055300175", stock: 48 },
      { name: "Coca-Cola 2L", category: "Refrescos", price: 38, cost: 28, barcode: "7501055300182", stock: 18 },
      { name: "Sprite 600ml", category: "Refrescos", price: 22, cost: 16, barcode: "7501055300199", stock: 35 },
      { name: "Boing Mango 1L", category: "Refrescos", price: 20, cost: 14, barcode: "7501055300205", stock: 22 },
      { name: "Agua Ciel 1L", category: "Refrescos", price: 14, cost: 10, barcode: "7501055300212", stock: 50 },
      { name: "Arroz La Merced 1kg", category: "Abarrotes", price: 28, cost: 21, barcode: "7501002100221", stock: 15 },
      { name: "Frijol Bayo 1kg", category: "Abarrotes", price: 32, cost: 24, barcode: "7501002100238", stock: 12 },
      { name: "Aceite Nutrioli 900ml", category: "Abarrotes", price: 45, cost: 34, barcode: "7501002100245", stock: 8 },
      { name: "Azúcar Morena 1kg", category: "Abarrotes", price: 35, cost: 26, barcode: "7501002100252", stock: 10 },
      { name: "Sal de Mesa 500g", category: "Abarrotes", price: 12, cost: 8, barcode: "7501002100269", stock: 30 },
      { name: "Leche Lala Entera 1L", category: "Lácteos", price: 26, cost: 20, barcode: "7501002100276", stock: 20 },
      { name: "Huevo Blanco 12pz", category: "Lácteos", price: 38, cost: 29, barcode: "7501002100283", stock: 24 },
      { name: "Yakult 5pz", category: "Lácteos", price: 22, cost: 16, barcode: "7501002100290", stock: 18 },
      { name: "Mantequilla Gloria 90g", category: "Lácteos", price: 16, cost: 11, barcode: "7501002100306", stock: 14 },
      { name: "Crema María 250g", category: "Lácteos", price: 24, cost: 18, barcode: "7501002100313", stock: 5 },
      { name: "Pan Bimbo Blanco 680g", category: "Pan", price: 40, cost: 31, barcode: "7501002100320", stock: 9 },
      { name: "Pan de Caja Integral Bimbo", category: "Pan", price: 45, cost: 35, barcode: "7501002100337", stock: 6 },
      { name: "Gansito Marinela", category: "Pan", price: 18, cost: 13, barcode: "7501002100344", stock: 28 },
      { name: "Barritas Marinela", category: "Pan", price: 15, cost: 11, barcode: "7501002100351", stock: 32 },
      { name: "Bubulubu", category: "Dulces", price: 10, cost: 6.5, barcode: "7501002100368", stock: 55 },
      { name: "Pulparindo", category: "Dulces", price: 8, cost: 5, barcode: "7501002100375", stock: 40 },
      { name: "Chicles Bubba Blo", category: "Dulces", price: 5, cost: 3, barcode: "7501002100382", stock: 70 },
      { name: "Mazapán de la Rosa", category: "Dulces", price: 10, cost: 7, barcode: "7501002100399", stock: 38 },
      { name: "Paleta Payaso", category: "Dulces", price: 6, cost: 3.5, barcode: "7501002100405", stock: 65 },
    ];

    this.products = items.map((p) => ({
      id: genId(),
      barcode: p.barcode,
      name: p.name,
      category: p.category,
      price: p.price,
      cost: p.cost,
      tax_rate: 16,
      stock: p.stock,
      low_stock_threshold: 5,
      active: true,
      created_at: now,
      updated_at: now,
    }));
  }

  private seedSales() {
    const today = new Date("2026-06-21");
    const products = this.products;

    function hoursAgo(h: number) {
      const d = new Date(today);
      d.setHours(d.getHours() - h);
      return d.toISOString();
    }

    const s1 = this.createSale(
      { subtotal: 86, tax_total: 13.76, discount: 0, total: 99.76, payment_method: "efectivo", amount_received: 150, change_given: 50.24 },
      hoursAgo(2),
      [
        { product_id: products[0].id, product_name: products[0].name, quantity: 2, unit_price: products[0].price, tax_rate: 16, line_total: 36 },
        { product_id: products[5].id, product_name: products[5].name, quantity: 1, unit_price: products[5].price, tax_rate: 16, line_total: 25 },
        { product_id: products[15].id, product_name: products[15].name, quantity: 1, unit_price: products[15].price, tax_rate: 16, line_total: 25 },
      ],
    );

    const s2 = this.createSale(
      { subtotal: 108, tax_total: 17.28, discount: 0, total: 125.28, payment_method: "tarjeta", amount_received: null, change_given: null },
      hoursAgo(4),
      [
        { product_id: products[10].id, product_name: products[10].name, quantity: 1, unit_price: products[10].price, tax_rate: 16, line_total: 28 },
        { product_id: products[12].id, product_name: products[12].name, quantity: 1, unit_price: products[12].price, tax_rate: 16, line_total: 45 },
        { product_id: products[20].id, product_name: products[20].name, quantity: 1, unit_price: products[20].price, tax_rate: 16, line_total: 35 },
      ],
    );

    const s3 = this.createSale(
      { subtotal: 38, tax_total: 6.08, discount: 0, total: 44.08, payment_method: "efectivo", amount_received: 50, change_given: 5.92 },
      hoursAgo(6),
      [
        { product_id: products[1].id, product_name: products[1].name, quantity: 1, unit_price: products[1].price, tax_rate: 16, line_total: 18 },
        { product_id: products[7].id, product_name: products[7].name, quantity: 1, unit_price: products[7].price, tax_rate: 16, line_total: 20 },
      ],
    );

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString();

    const s4 = this.createSale(
      { subtotal: 152, tax_total: 24.32, discount: 10, total: 166.32, payment_method: "transferencia", amount_received: null, change_given: null },
      yStr,
      [
        { product_id: products[6].id, product_name: products[6].name, quantity: 2, unit_price: products[6].price, tax_rate: 16, line_total: 76 },
        { product_id: products[16].id, product_name: products[16].name, quantity: 2, unit_price: products[16].price, tax_rate: 16, line_total: 76 },
      ],
    );

    const d3 = new Date(today);
    d3.setDate(d3.getDate() - 3);

    const s5 = this.createSale(
      { subtotal: 60, tax_total: 9.6, discount: 0, total: 69.6, payment_method: "efectivo", amount_received: 100, change_given: 30.4 },
      d3.toISOString(),
      [
        { product_id: products[23].id, product_name: products[23].name, quantity: 4, unit_price: products[23].price, tax_rate: 16, line_total: 60 },
      ],
    );

    this.sales.push(s1, s2, s3, s4, s5);
  }

  private createSale(
    data: {
      subtotal: number; tax_total: number; discount: number; total: number;
      payment_method: string; amount_received: number | null; change_given: number | null;
    },
    createdAt: string,
    items: Array<{
      product_id: string; product_name: string; quantity: number; unit_price: number;
      tax_rate: number; line_total: number;
    }>,
  ): DemoSale {
    const saleId = genId();
    for (const item of items) {
      this.saleItems.push({
        id: genId(), sale_id: saleId, ...item, created_at: createdAt,
      });
      this.movements.push({
        id: genId(), product_id: item.product_id, movement_type: "venta",
        quantity: -item.quantity, note: `Venta ${saleId.slice(0, 8)}`,
        user_id: DEMO_USER_ID, created_at: createdAt,
      });
    }
    return { id: saleId, cashier_id: DEMO_USER_ID, ...data, created_at: createdAt };
  }
}

let _instance: DemoStore | null = null;
export function getDemoStore() {
  if (!_instance) _instance = new DemoStore();
  return _instance;
}
