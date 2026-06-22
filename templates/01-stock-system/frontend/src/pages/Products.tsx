import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./Products.module.css";
import { Filters } from "@/components/global/products/Filters";

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

const initialProducts: Product[] = [
  { id: 1, sku: "PRD-001", name: "Laptop Dell XPS 15", category: "Computadoras", price: 1299.99, quantity: 45, status: "in-stock" },
  { id: 2, sku: "PRD-002", name: "Mouse Logitech MX Master 3", category: "Periféricos", price: 99.99, quantity: 1, status: "out-of-stock" },
  { id: 3, sku: "PRD-003", name: "Teclado Mecánico RGB", category: "Periféricos", price: 149.99, quantity: 3, status: "low-stock" },
];

const categories = ["Todas", "Computadoras", "Periféricos", "Monitores", "Accesorios", "Audio", "Cables"];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "Todas" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatus = (q: number): Product["status"] => {
    if (q > 10) return "in-stock";
    if (q > 0) return "low-stock";
    return "out-of-stock";
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        sku: product.sku,
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({ sku: "", name: "", category: "", price: "", quantity: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const newProduct: Product = {
      id: editingProduct?.id || products.length + 1,
      sku: formData.sku,
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      status: getStatus(parseInt(formData.quantity)),
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProducts([...products, newProduct]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const statusLabel = {
    "in-stock": "En Stock",
    "low-stock": "Stock Bajo",
    "out-of-stock": "Sin Stock",
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Productos</h1>
          <p>Gestiona el catálogo de productos</p>
        </div>

        <button className={styles.primaryBtn} onClick={() => openModal()}>
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className={styles.card}>
        <Filters
          categories={categories}
          inputSearchTerm={searchTerm}
          inputSetSearchTerm={(e) => setSearchTerm(e.target.value)}
          selectCategoryFilter={categoryFilter}
          selectSetCategoryFilter={(e) => setCategoryFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2><Package size={18} /> Lista de Productos</h2>
          <span>{filteredProducts.length} productos</span>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.quantity}</td>
                <td>
                  <span className={`${styles.badge} ${styles[p.status]}`}>
                    {statusLabel[p.status]}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button><Eye size={16} color="var(--font-color-title)" /></button>
                  <button onClick={() => openModal(p)}><Edit size={16} color="var(--font-color-title)" /></button>
                  <button onClick={() => handleDelete(p.id)}><Trash2 size={16} color="var(--font-color-title)" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination (simple) */}
        <div className={styles.pagination}>
          <button disabled><ChevronLeft size={16} /></button>
          <button className={styles.pageActive}>1</button>
          <button disabled><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h3>

            <input
              placeholder="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />

            <input
              placeholder="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Categoría</option>
              {categories.slice(1).map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Precio"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />

            <input
              type="number"
              placeholder="Cantidad"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />

            <div className={styles.modalActions}>
              <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className={styles.primaryBtn} onClick={handleSubmit}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
