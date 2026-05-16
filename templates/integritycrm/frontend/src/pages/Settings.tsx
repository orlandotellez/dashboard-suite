import { useAuthStore } from '@/store/useAuthStore'
import styles from './Settings.module.css'

export default function Settings() {
  const { user } = useAuthStore()

  return (
    <div className={styles.settings}>
      <h1>Configuración</h1>

      <div className={styles.sections}>
        <div className={styles.section}>
          <h2>Perfil</h2>
          <div className={styles.field}>
            <label>Nombre</label>
            <input type="text" defaultValue={user?.name} />
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" defaultValue={user?.email} />
          </div>
          <button className={styles.saveBtn}>Guardar cambios</button>
        </div>

        <div className={styles.section}>
          <h2>Seguridad</h2>
          <div className={styles.field}>
            <label>Contraseña actual</label>
            <input type="password" />
          </div>
          <div className={styles.field}>
            <label>Nueva contraseña</label>
            <input type="password" />
          </div>
          <div className={styles.field}>
            <label>Confirmar contraseña</label>
            <input type="password" />
          </div>
          <button className={styles.saveBtn}>Cambiar contraseña</button>
        </div>

        <div className={styles.section}>
          <h2>Notificaciones</h2>
          <label className={styles.toggleField}>
            <input type="checkbox" defaultChecked />
            <span>Notificaciones de email</span>
          </label>
          <label className={styles.toggleField}>
            <input type="checkbox" defaultChecked />
            <span>Notificaciones push</span>
          </label>
          <label className={styles.toggleField}>
            <input type="checkbox" />
            <span>Notificaciones de tareas</span>
          </label>
        </div>

        <div className={styles.section}>
          <h2>Preferencias</h2>
          <div className={styles.field}>
            <label>Idioma</label>
            <select defaultValue="es">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Zona horaria</label>
            <select defaultValue="America/Mexico_City">
              <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
              <option value="America/New_York">Nueva York (GMT-5)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}