import { useState, useMemo } from 'react'
import { Search, Filter, Plus, LayoutGrid, List, Table as TableIcon } from 'lucide-react'
import { useDealsStore, DealStage, Deal } from '@/store/useDealsStore'
import { useContactsStore } from '@/store/useContactsStore'
import styles from './Pipeline.module.css'

const stageConfig: Record<DealStage, { label: string; color: string }> = {
  PROSPECTO: { label: 'Prospecto', color: '#6B7280' },
  CONTACTADO: { label: 'Contactado', color: '#2563EB' },
  PROPUESTA: { label: 'Propuesta', color: '#D97706' },
  NEGOCIACION: { label: 'Negociación', color: '#7C3AED' },
  GANADO: { label: 'Ganado', color: '#16A34A' },
  PERDIDO: { label: 'Perdido', color: '#DC2626' },
}

const stages: DealStage[] = ['PROSPECTO', 'CONTACTADO', 'PROPUESTA', 'NEGOCIACION', 'GANADO', 'PERDIDO']

export default function Pipeline() {
  const { deals, moveDeal } = useDealsStore()
  const { contacts } = useContactsStore()
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'table'>('kanban')
  const [search, setSearch] = useState('')

  const filteredDeals = useMemo(() => {
    if (!search) return deals
    return deals.filter(d =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.company.toLowerCase().includes(search.toLowerCase())
    )
  }, [deals, search])

  const dealsByStage = useMemo(() => {
    const grouped = stages.reduce((acc, stage) => {
      acc[stage] = filteredDeals.filter(d => d.stage === stage)
      return acc
    }, {} as Record<DealStage, Deal[]>)
    return grouped
  }, [filteredDeals])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData('dealId')
    if (dealId) {
      moveDeal(dealId, stage)
    }
  }

  return (
    <div className={styles.pipeline}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Pipeline de ventas</h1>
        
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar oportunidades..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button className={styles.filterBtn}>
            <Filter />
            Filtros
          </button>
        </div>

        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'kanban' ? styles.active : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'table' ? styles.active : ''}`}
            onClick={() => setViewMode('table')}
          >
            <TableIcon size={16} />
          </button>
        </div>

        <button className={styles.newBtn}>
          <Plus size={16} />
          Nueva oportunidad
        </button>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <div className={styles.board}>
          {stages.map((stage) => {
            const config = stageConfig[stage]
            const stageDeals = dealsByStage[stage]
            const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0)
            
            return (
              <div
                key={stage}
                className={styles.column}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className={styles.columnHeader}>
                  <div className={styles.columnTitle}>
                    <span className={styles.stageDot} style={{ background: config.color }} />
                    <span>{config.label}</span>
                  </div>
                  <span className={styles.stageCount} style={{ background: `${config.color}20`, color: config.color }}>
                    {stageDeals.length}
                  </span>
                  <span className={styles.stageValue}>
                    {formatCurrency(totalValue)}
                  </span>
                </div>
                
                <div className={styles.columnContent}>
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className={styles.dealCard}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                    >
                      <div className={styles.dealHeader}>
                        <span className={styles.dealCompany}>{deal.company}</span>
                        {deal.tags[0] && (
                          <span className={styles.dealTag}>{deal.tags[0]}</span>
                        )}
                      </div>
                      <div className={styles.dealTitle}>{deal.title}</div>
                      <div className={styles.dealValue}>{formatCurrency(deal.value)}</div>
                      <div className={styles.dealProbability}>
                        <div className={styles.probBar}>
                          <div
                            className={styles.probFill}
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <span>{deal.probability}%</span>
                      </div>
                      {deal.expectedCloseDate && (
                        <div className={styles.dealDate}>
                          📅 {new Date(deal.expectedCloseDate).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button className={styles.addDealBtn}>
                    + Agregar oportunidad
                  </button>
                </div>
                
                <div className={styles.columnFooter}>
                  Total: {formatCurrency(totalValue)} · {stageDeals.length} deals
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className={styles.listView}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Contacto</th>
                <th>Etapa</th>
                <th>Valor</th>
                <th>Probabilidad</th>
                <th>Responsable</th>
                <th>Cierre</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal) => (
                <tr key={deal.id}>
                  <td>
                    <div className={styles.companyCell}>
                      <span className={styles.companyName}>{deal.company}</span>
                      <span className={styles.dealTitleSmall}>{deal.title}</span>
                    </div>
                  </td>
                  <td>-</td>
                  <td>
                    <span className={styles.stageBadge} style={{ background: `${stageConfig[deal.stage].color}20`, color: stageConfig[deal.stage].color }}>
                      {stageConfig[deal.stage].label}
                    </span>
                  </td>
                  <td className={styles.valueCell}>{formatCurrency(deal.value)}</td>
                  <td>
                    <div className={styles.miniProb}>
                      <div className={styles.miniProbBar}>
                        <div style={{ width: `${deal.probability}%`, background: stageConfig[deal.stage].color }} />
                      </div>
                      <span>{deal.probability}%</span>
                    </div>
                  </td>
                  <td>-</td>
                  <td>{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString('es-ES') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}