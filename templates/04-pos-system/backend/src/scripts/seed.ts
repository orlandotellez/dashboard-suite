import { prisma } from "@/config/prisma.js";
import { hashPassword } from "@/core/utils/crypto.utils";

// ============================================================
// CATEGORÍAS (seeder upsert por name, UUIDs autogenerados)
// ============================================================
const categories = [
  { name: "Chiverías y Snacks", description: "Botanas, papas, chicharrones y snacks en general" },
  { name: "Galletas", description: "Galletas dulces, saladas, wafers y chocolates" },
  { name: "Dulces, Caramelos y Chocolates", description: "Caramelos, chicles, gomitas, bombones y chocolates" },
  { name: "Bebidas", description: "Gaseosas, jugos, aguas, energizantes y malta" },
  { name: "Abarrotes", description: "Café, leche, sopas, salsas, aceite y complementos de despensa" },
  { name: "Higiene y Desechables", description: "Papel higiénico, jabón, detergente y desechables" },
];

// Mapa name → uuid para asignar a los productos después del upsert
type CategoryMap = Record<string, string>;

type ProductSeed = {
  name: string;
  unit_type: string;
  unit_quantity?: number;
  category_name: string;  // resolves via catMap
  cost: number;
  price: number;
  stock: number;
  low_stock_threshold: number;
  tax_rate: number;
  barcode?: string;
};

const products: ProductSeed[] = [
  // ── Chiverías y Snacks ────────────────────────────────────
  { name: "Ranchitas Originales", unit_type: "Ristra", unit_quantity: 12, category_name: "Chiverías y Snacks", cost: 55.0, price: 70.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Jalapeños Diana", unit_type: "Ristra", unit_quantity: 12, category_name: "Chiverías y Snacks", cost: 60.0, price: 75.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Elotitos Diana", unit_type: "Ristra", unit_quantity: 12, category_name: "Chiverías y Snacks", cost: 60.0, price: 75.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Zambos con Chile", unit_type: "Ristra", unit_quantity: 12, category_name: "Chiverías y Snacks", cost: 70.0, price: 85.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Platanitos Yummis", unit_type: "Ristra", unit_quantity: 12, category_name: "Chiverías y Snacks", cost: 65.0, price: 80.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Cheetos Flamin' Hot", unit_type: "Ristra", unit_quantity: 12, category_name: "Chiverías y Snacks", cost: 80.0, price: 95.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Doritos Nacho", unit_type: "Ristra", unit_quantity: 12, category_name: "Chiverías y Snacks", cost: 80.0, price: 95.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Tronquitos", unit_type: "Ristra", unit_quantity: 12, category_name: "Chiverías y Snacks", cost: 55.0, price: 70.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Chicharrón Señorial", unit_type: "Ristra", unit_quantity: 12, category_name: "Chiverías y Snacks", cost: 65.0, price: 80.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Maní Salado Pro", unit_type: "Ristra", unit_quantity: 12, category_name: "Chiverías y Snacks", cost: 70.0, price: 85.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },

  // ── Galletas ──────────────────────────────────────────────
  { name: "Galletas Pozuelo Chiky Chocolate", unit_type: "Paquete", unit_quantity: 12, category_name: "Galletas", cost: 75.0, price: 90.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Galletas Pozuelo Club Social", unit_type: "Paquete", unit_quantity: 12, category_name: "Galletas", cost: 65.0, price: 80.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Galletas Oreo Regular", unit_type: "Paquete", unit_quantity: 12, category_name: "Galletas", cost: 90.0, price: 110.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Galletas Gamesa Marías", unit_type: "Paquete", unit_quantity: 12, category_name: "Galletas", cost: 85.0, price: 105.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Galletas Cuétara Soda", unit_type: "Paquete", unit_quantity: 12, category_name: "Galletas", cost: 50.0, price: 65.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Wafer Pozuelo Vainilla/Fresa", unit_type: "Paquete", unit_quantity: 12, category_name: "Galletas", cost: 70.0, price: 85.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Galletas Canasta Pozuelo", unit_type: "Paquete", unit_quantity: 12, category_name: "Galletas", cost: 75.0, price: 90.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
  { name: "Best Chocolate Pozuelo", unit_type: "Paquete", unit_quantity: 12, category_name: "Galletas", cost: 80.0, price: 95.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },

  // ── Dulces, Caramelos y Chocolates ────────────────────────
  { name: "Caramelos Super Hiper Ácido", unit_type: "Bolsa", unit_quantity: 100, category_name: "Dulces, Caramelos y Chocolates", cost: 45.0, price: 60.0, stock: 30, low_stock_threshold: 5, tax_rate: 0 },
  { name: "Bombones Bum Bum Molina", unit_type: "Bolsa", unit_quantity: 24, category_name: "Dulces, Caramelos y Chocolates", cost: 55.0, price: 70.0, stock: 30, low_stock_threshold: 5, tax_rate: 0 },
  { name: "Chicles Clorets", unit_type: "Caja", unit_quantity: 60, category_name: "Dulces, Caramelos y Chocolates", cost: 85.0, price: 105.0, stock: 30, low_stock_threshold: 5, tax_rate: 0 },
  { name: "Chicles Trident Menta", unit_type: "Caja", unit_quantity: 12, category_name: "Dulces, Caramelos y Chocolates", cost: 110.0, price: 135.0, stock: 30, low_stock_threshold: 5, tax_rate: 0 },
  { name: "Marshmallows Malvaviscos", unit_type: "Bolsa", category_name: "Dulces, Caramelos y Chocolates", cost: 40.0, price: 55.0, stock: 30, low_stock_threshold: 5, tax_rate: 0 },
  { name: "Chocolates Crunch / Nestlé", unit_type: "Caja", unit_quantity: 12, category_name: "Dulces, Caramelos y Chocolates", cost: 140.0, price: 170.0, stock: 30, low_stock_threshold: 5, tax_rate: 0 },
  { name: "Caramelos de Leche Vaquita", unit_type: "Bolsa", unit_quantity: 100, category_name: "Dulces, Caramelos y Chocolates", cost: 50.0, price: 65.0, stock: 30, low_stock_threshold: 5, tax_rate: 0 },
  { name: "Gomitas Trululu", unit_type: "Paquete", unit_quantity: 12, category_name: "Dulces, Caramelos y Chocolates", cost: 65.0, price: 80.0, stock: 30, low_stock_threshold: 5, tax_rate: 0 },
  { name: "Mentas Heladas", unit_type: "Bolsa", unit_quantity: 100, category_name: "Dulces, Caramelos y Chocolates", cost: 40.0, price: 55.0, stock: 30, low_stock_threshold: 5, tax_rate: 0 },

  // ── Bebidas ────────────────────────────────────────────────
  { name: "Coca-Cola 355ml Vidrio", unit_type: "Caja", unit_quantity: 24, category_name: "Bebidas", cost: 310.0, price: 360.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Coca-Cola 500ml PET", unit_type: "Paquete", unit_quantity: 12, category_name: "Bebidas", cost: 210.0, price: 240.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Coca-Cola 3 Litros", unit_type: "Paquete", unit_quantity: 4, category_name: "Bebidas", cost: 260.0, price: 290.0, stock: 12, low_stock_threshold: 4, tax_rate: 0 },
  { name: "Pepsi 500ml", unit_type: "Paquete", unit_quantity: 12, category_name: "Bebidas", cost: 180.0, price: 210.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Rojita 500ml", unit_type: "Paquete", unit_quantity: 12, category_name: "Bebidas", cost: 165.0, price: 195.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Jugos del Valle Naranja/Manzana", unit_type: "Paquete", unit_quantity: 12, category_name: "Bebidas", cost: 190.0, price: 220.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Jugos Petit Lata/Tetra", unit_type: "Paquete", unit_quantity: 24, category_name: "Bebidas", cost: 280.0, price: 330.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Energizante Raptor", unit_type: "Paquete", unit_quantity: 12, category_name: "Bebidas", cost: 240.0, price: 280.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Energizante AMP", unit_type: "Paquete", unit_quantity: 12, category_name: "Bebidas", cost: 220.0, price: 260.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Agua Purificada Fuente Pura 600ml", unit_type: "Paquete", unit_quantity: 24, category_name: "Bebidas", cost: 180.0, price: 220.0, stock: 48, low_stock_threshold: 12, tax_rate: 0 },
  { name: "Sula Malta", unit_type: "Paquete", unit_quantity: 6, category_name: "Bebidas", cost: 110.0, price: 130.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },

  // ── Abarrotes ─────────────────────────────────────────────
  { name: "Café Presto Instantáneo", unit_type: "Ristra", unit_quantity: 12, category_name: "Abarrotes", cost: 48.0, price: 60.0, stock: 50, low_stock_threshold: 12, tax_rate: 0 },
  { name: "Leche Doña Blanca en Polvo", unit_type: "Paquete", unit_quantity: 12, category_name: "Abarrotes", cost: 130.0, price: 155.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Tang / Clight Refresco en Polvo", unit_type: "Caja", unit_quantity: 20, category_name: "Abarrotes", cost: 140.0, price: 170.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Sabor Ami / Maggi Mi Sazón", unit_type: "Ristra", unit_quantity: 12, category_name: "Abarrotes", cost: 35.0, price: 45.0, stock: 50, low_stock_threshold: 12, tax_rate: 0 },
  { name: "Sopa Maruchan Vaso", unit_type: "Caja", unit_quantity: 12, category_name: "Abarrotes", cost: 220.0, price: 260.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Salsa de Tomate Natura's", unit_type: "Ristra", unit_quantity: 12, category_name: "Abarrotes", cost: 95.0, price: 115.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Frijoles Rojos Blanditos", unit_type: "Caja", unit_quantity: 12, category_name: "Abarrotes", cost: 280.0, price: 320.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Aceite Tip-Top 1 Litro", unit_type: "Caja", unit_quantity: 12, category_name: "Abarrotes", cost: 720.0, price: 780.0, stock: 12, low_stock_threshold: 3, tax_rate: 0 },

  // ── Higiene y Desechables ─────────────────────────────────
  { name: "Papel Higiénico Rosal 4 rollos", unit_type: "Paquete", unit_quantity: 10, category_name: "Higiene y Desechables", cost: 380.0, price: 430.0, stock: 20, low_stock_threshold: 5, tax_rate: 0 },
  { name: "Jabón de Baño Protex", unit_type: "Paquete", unit_quantity: 4, category_name: "Higiene y Desechables", cost: 125.0, price: 145.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Detergente Rinso 250g", unit_type: "Paquete", unit_quantity: 12, category_name: "Higiene y Desechables", cost: 160.0, price: 190.0, stock: 24, low_stock_threshold: 6, tax_rate: 0 },
  { name: "Vasos Desechables 8oz", unit_type: "Paquete", unit_quantity: 50, category_name: "Higiene y Desechables", cost: 35.0, price: 45.0, stock: 50, low_stock_threshold: 10, tax_rate: 0 },
];

const seed = async () => {
  console.log("🌱 Iniciando seeder de POS...");

  // ── Categorías ─────────────────────────────────────────────
  const catMap: CategoryMap = {};

  // Limpiamos datos existentes (ordenado por FKs)
  await prisma.inventory_movement.deleteMany({});
  await prisma.sale_item.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  console.log(`📂 Sembrando ${categories.length} categorías...`);
  for (const cat of categories) {
    const created = await prisma.category.create({
      data: { name: cat.name, description: cat.description },
    });
    catMap[cat.name] = created.id;
  }
  console.log(`   ✅ ${categories.length} categorías con UUID`);

  // ── Productos ──────────────────────────────────────────────
  console.log(`📦 Sembrando ${products.length} productos con UUID...`);
  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        unit_type: p.unit_type,
        unit_quantity: p.unit_quantity,
        category_id: catMap[p.category_name],
        cost: p.cost,
        price: p.price,
        stock: p.stock,
        low_stock_threshold: p.low_stock_threshold,
        tax_rate: p.tax_rate,
        active: true,
      },
    });
  }
  console.log(`   ✅ ${products.length} productos creados con UUID`);

  // ── Usuarios de prueba ──────────────────────────────────────
  const testUsers = [
    { name: "Admin", email: "admin@smart-miscelanea.com", password: "admin123", role: "admin" as const },
    { name: "Cajero", email: "cajero@smart-miscelanea.com", password: "cajero123", role: "cajero" as const },
  ];

  console.log(`👤 Sembrando ${testUsers.length} usuarios de prueba...`);
  for (const u of testUsers) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        role: u.role,
        email_verified: true,
      },
    });

    const hashedPassword = await hashPassword(u.password);
    await prisma.account.create({
      data: {
        account_id: user.id,
        provider_id: "credentials",
        user_id: user.id,
        password: hashedPassword,
      },
    });
    console.log(`   ✅ ${u.email} (${u.role})`);
  }

  console.log("");
  console.log("🎉 Seeder completado exitosamente!");
  console.log("");
  console.log("🔐 Usuarios de prueba:");
  for (const u of testUsers) {
    console.log(`   • ${u.email} / ${u.password} (${u.role})`);
  }
  console.log(`   📦 Productos por categoría:`);

  const counts = await prisma.product.groupBy({
    by: ["category_id"],
    _count: { id: true },
    where: { deleted_at: null },
  });

  for (const c of counts) {
    const cat = await prisma.category.findUnique({ where: { id: c.category_id! } });
    if (cat) console.log(`      • ${cat.name}: ${c._count.id} productos`);
  }
};

seed()
  .catch((e) => {
    console.error("❌ Seeder falló:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
