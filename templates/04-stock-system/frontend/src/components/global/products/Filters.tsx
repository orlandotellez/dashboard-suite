import { Download, Search } from "lucide-react"
import styles from "./Filters.module.css"

interface FiltersProps {
  categories: string[]

  inputSearchTerm: string
  inputSetSearchTerm: (e: React.ChangeEvent<HTMLInputElement>) => void

  selectCategoryFilter: string
  selectSetCategoryFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const Filters = ({ categories, inputSearchTerm, inputSetSearchTerm, selectCategoryFilter, selectSetCategoryFilter }: FiltersProps) => {
  return (
    <>
      <div className={styles.filters}>
        <div className={styles.search}>
          <Search size={16} color="var(--font-color-title)" />
          <input
            placeholder="Buscar por nombre o SKU..."
            value={inputSearchTerm}
            onChange={inputSetSearchTerm}
          />
        </div>

        <select
          value={selectCategoryFilter}
          onChange={selectSetCategoryFilter}
          className={styles.select}
        >
          {categories.map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <button className={styles.outlineBtn}>
          <Download size={16} /> Exportar
        </button>
      </div>

    </>
  )
}

