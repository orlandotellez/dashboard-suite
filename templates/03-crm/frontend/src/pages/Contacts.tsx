import { useState, useMemo } from 'react'
import { Search, Plus, Grid, List, Mail, Trash2 } from 'lucide-react'
import { useContactsStore } from '@/store/useContactsStore'
import styles from './Contacts.module.css'

export default function Contacts() {
  const { contacts } = useContactsStore()
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [search, setSearch] = useState('')

  const filteredContacts = useMemo(() => {
    if (!search) return contacts
    return contacts.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
    )
  }, [contacts, search])

  return (
    <div className={styles.contacts}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Contactos</h1>
          <span className={styles.countBadge}>{filteredContacts.length}</span>
        </div>

        <div className={styles.actions}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar contactos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className={styles.secondaryBtn}>Importar CSV</button>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List size={16} />
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'cards' ? styles.active : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <Grid size={16} />
            </button>
          </div>

          <button className={styles.primaryBtn}>
            <Plus size={16} />
            Nuevo contacto
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className={styles.tableView}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Empresa</th>
                <th>Cargo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Etiquetas</th>
                <th>Fuente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar} style={{ background: contact.avatarColor }}>
                        {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className={styles.nameInfo}>
                        <span className={styles.name}>{contact.name}</span>
                        <span className={styles.email}>{contact.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{contact.company}</td>
                  <td>{contact.role || '-'}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone || '-'}</td>
                  <td>
                    <div className={styles.tags}>
                      {contact.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className={styles.tag}>{tag}</span>
                      ))}
                      {contact.tags.length > 2 && (
                        <span className={styles.tagMore}>+{contact.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={styles.sourceBadge}>{contact.source || 'directo'}</span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button className={styles.iconBtn} title="Enviar email">
                        <Mail size={14} />
                      </button>
                      <button className={styles.iconBtn} title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {filteredContacts.map((contact) => (
            <div key={contact.id} className={styles.contactCard}>
              <div className={styles.cardHeader} style={{ background: contact.avatarColor }} />
              <div className={styles.cardAvatar} style={{ background: contact.avatarColor }}>
                {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className={styles.cardContent}>
                <h3>{contact.name}</h3>
                <p className={styles.cardRole}>{contact.role}</p>
                <p className={styles.cardCompany}>{contact.company}</p>
                <div className={styles.cardTags}>
                  {contact.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}