import { useState } from 'react'
import { Inbox, Send, Archive, Trash2, Star, Paperclip, Search, PenLine } from 'lucide-react'
import styles from './Emails.module.css'

const mockEmails = [
  { id: '1', from: 'roberto@techcorp.com', name: 'Roberto García', subject: 'Re: Reunión de seguimiento', preview: 'Gracias por la propuesta,我们可以后天上午...', time: '10:30', read: false, starred: true, hasAttachment: true },
  { id: '2', from: 'maria@innovadigital.com', name: 'María López', subject: 'Consulta sobre servicios', preview: 'Hola, me gustaría conocer más sobre...', time: '9:15', read: false, starred: false, hasAttachment: false },
  { id: '3', from: 'carlos@nexus.com', name: 'Carlos Ruiz', subject: 'Propuesta aceptada', preview: 'Excelentes noticias! Nuestro equipo ha...', time: 'Ayer', read: true, starred: true, hasAttachment: true },
  { id: '4', from: 'laura@stellar.com', name: 'Laura Díaz', subject: 'Demo programada', preview: 'Perfecto, nos vemos el jueves a las...', time: 'Ayer', read: true, starred: false, hasAttachment: false },
  { id: '5', from: 'ana@data.com', name: 'Ana Smith', subject: 'Información adicional', preview: 'Adjunto encontraras la documentación...', time: '2 días', read: true, starred: false, hasAttachment: true },
]

const folders = [
  { id: 'inbox', label: 'Entrada', icon: Inbox, count: 3 },
  { id: 'sent', label: 'Enviados', icon: Send, count: 0 },
  { id: 'draft', label: 'Borradores', icon: PenLine, count: 1 },
  { id: 'archived', label: 'Archivados', icon: Archive, count: 0 },
  { id: 'spam', label: 'Spam', icon: Trash2, count: 0 },
]

export default function Emails() {
  const [selectedFolder, setSelectedFolder] = useState('inbox')
  const [selectedEmail, setSelectedEmail] = useState(mockEmails[0])

  return (
    <div className={styles.emails}>
      {/* Folders Panel */}
      <div className={styles.foldersPanel}>
        <button className={styles.composeBtn}>
          <PenLine size={16} />
          Redactar
        </button>

        <div className={styles.foldersList}>
          {folders.map(folder => (
            <button
              key={folder.id}
              className={`${styles.folderBtn} ${selectedFolder === folder.id ? styles.active : ''}`}
              onClick={() => setSelectedFolder(folder.id)}
            >
              <folder.icon size={16} />
              <span>{folder.label}</span>
              {folder.count > 0 && <span className={styles.folderCount}>{folder.count}</span>}
            </button>
          ))}
        </div>

        <div className={styles.labelsSection}>
          <h4>Etiquetas</h4>
          <button className={styles.labelBtn}><span className={styles.labelDot} style={{ background: '#2563EB' }} />Clientes</button>
          <button className={styles.labelBtn}><span className={styles.labelDot} style={{ background: '#D97706' }} />Leads</button>
          <button className={styles.labelBtn}><span className={styles.labelDot} style={{ background: '#7C3AED' }} />Interno</button>
        </div>
      </div>

      {/* Email List */}
      <div className={styles.emailList}>
        <div className={styles.listHeader}>
          <input type="text" placeholder="Buscar correos..." className={styles.searchInput} />
        </div>
        <div className={styles.listContent}>
          {mockEmails.map(email => (
            <div
              key={email.id}
              className={`${styles.emailItem} ${selectedEmail.id === email.id ? styles.selected : ''} ${!email.read ? styles.unread : ''}`}
              onClick={() => setSelectedEmail(email)}
            >
              <div className={styles.emailAvatar}>{email.name.split(' ').map(n => n[0]).join('')}</div>
              <div className={styles.emailInfo}>
                <div className={styles.emailFrom}>{email.name}</div>
                <div className={styles.emailSubject}>{email.subject}</div>
                <div className={styles.emailPreview}>{email.preview}</div>
              </div>
              <div className={styles.emailMeta}>
                {email.starred && <Star size={14} className={styles.starred} />}
                {email.hasAttachment && <Paperclip size={14} />}
                <span>{email.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Content */}
      <div className={styles.emailContent}>
        <div className={styles.toolbar}>
          <button>Responder</button>
          <button>Reenviar</button>
          <button>Archivar</button>
          <button>Eliminar</button>
        </div>
        <div className={styles.emailHeader}>
          <h2>{selectedEmail.subject}</h2>
          <div className={styles.fromLine}>
            <div className={styles.fromAvatar}>{selectedEmail.name.split(' ').map(n => n[0]).join('')}</div>
            <div>
              <strong>{selectedEmail.name}</strong>
              <span>&lt;{selectedEmail.from}&gt;</span>
            </div>
            <span className={styles.emailDate}>{selectedEmail.time}</span>
          </div>
        </div>
        <div className={styles.emailBody}>
          <p>{selectedEmail.preview}</p>
          <p>Saludos cordiales,<br/>{selectedEmail.name}</p>
        </div>
      </div>
    </div>
  )
}