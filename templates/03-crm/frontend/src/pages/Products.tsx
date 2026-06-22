import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Package, ShoppingCart, RefreshCw } from 'lucide-react'
import styles from './Products.module.css'

const products = [
  { id: 1, name: 'CRM Enterprise', sku: 'CRM-ENT-001', category: 'Software', price: 15000, type: 'SUSCRIPCION', status: 'ACTIVE' },
  { id: 2, name: 'Consultoría estratégica', sku: 'CON-STR-001', category: 'Servicios', price: 5000, type: 'SERVICIO', status: 'ACTIVE' },
  { id: 3, name: 'Implementación básica', sku: 'IMP-BAS-001', category: 'Servicios', price: 2500, type: 'SERVICIO', status: 'ACTIVE' },
  { id: 4, name: 'CRM Starter', sku: 'CRM-STA-001', category: 'Software', price: 500, type: 'SUSCRIPCION', status: 'ACTIVE' },
  { id: 5, name: 'Capacitación equipo', sku: 'CAP-EQU-001', category: 'Servicios', price: 1500, type: 'SERVICIO', status: 'INACTIVE' },
]

const typeColors = { PRODUCTO: '#2563EB', SERVICIO: '#7C3AED', SUSCRIPCION: '#16A34A' }

export default function Products() {
  return (
    <div className={styles.products}>
      <div className={styles.header}>
        <h1>Catálogo de Productos y Servicios</h1>
        <div className={styles.actions}>
          <div className={styles.searchBox}><Search size={16} /><input type="text" placeholder="Buscar productos..." /></div>
          <button className={styles.newBtn}><Plus size={16} />Nuevo producto</button>
        </div>
      </div>

      <div className={styles.tableView}>
        <table className={styles.table}>
          <thead>
            <tr><th>Producto</th><th>SKU</th><th>Categoría</th><th>Precio</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><div className={styles.prodCell}><Package size={16} /><span>{p.name}</span></div></td>
                <td><code>{p.sku}</code></td>
                <td>{p.category}</td>
                <td className={styles.price}>${p.price.toLocaleString()}</td>
                <td><span className={styles.typeBadge} style={{ background: `${typeColors[p.type as keyof typeof typeColors]}20`, color: typeColors[p.type as keyof typeof typeColors] }}>{p.type}</span></td>
                <td><span className={styles.statusBadge} style={{ background: p.status === 'ACTIVE' ? '#16A34A20' : '#6B728020', color: p.status === 'ACTIVE' ? '#16A34A' : '#6B7280' }}>{p.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  <div className={styles.rowActions}>
                    <button><Edit size={14} /></button>
                    <button><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}