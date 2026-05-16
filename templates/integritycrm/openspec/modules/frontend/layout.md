# Layout - Componentes de Layout

## src/components/layout/DashboardLayout.tsx

```typescript
import { SideBar } from './SideBar';
import { Header } from './Header';
import { useSideBarStore } from '@/store/useSideBarStore';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { collapsed } = useSideBarStore();

  return (
    <div
      className={`${styles.container} ${
        collapsed ? styles.collapsed : styles.expanded
      }`}
    >
      <header>
        <SideBar />
      </header>
      <main className={styles.content}>
        <Header />
        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  );
};
```

---

## src/components/layout/DashboardLayout.module.css

```css
.container {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-page);
}

.container.expanded {
  --sidebar-width: 240px;
}

.container.collapsed {
  --sidebar-width: 64px;
}

.container > header {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  z-index: 100;
}

.content {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.2s ease;
}

.collapsed .content {
  margin-left: 64px;
}

.pageContent {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
```

---

## src/components/layout/SideBar.tsx

```typescript
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Hexagon } from 'lucide-react';
import { navItems, getNavGroups } from '@/routes/NavItems';
import { useSideBarStore } from '@/store/useSideBarStore';
import styles from './SideBar.module.css';

export const SideBar = () => {
  const { collapsed, setCollapsed } = useSideBarStore();
  const navigate = useNavigate();
  const location = useLocation();

  const groups = getNavGroups();

  return (
    <aside
      className={`${styles.sidebar} ${
        collapsed ? styles.collapsed : styles.expanded
      }`}
    >
      {/* Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <Hexagon className={styles.iconLarge} />
        </div>
        {!collapsed && (
          <div className={styles.logoText}>
            <h1>IntegrityCRM</h1>
            <p>Agencia Pro</p>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      {groups.map((group) => (
        <div key={group.label} className={styles.navGroup}>
          {!collapsed && (
            <span className={styles.groupLabel}>{group.label}</span>
          )}
          <nav className={styles.nav}>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`${styles.navItem} ${isActive ? styles.active : ''} ${
                    collapsed ? styles.isCollapsedIcon : ''
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      ))}

      {/* Collapse Button */}
      <div className={styles.collapseContainer}>
        <button onClick={setCollapsed} className={styles.collapseButton}>
          {collapsed ? (
            <ChevronRight className={styles.icon} />
          ) : (
            <>
              <ChevronLeft className={styles.icon} />
              <span className={styles.collapseText}>Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
```

---

## src/components/layout/SideBar.module.css

```css
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-default);
}

.logoContainer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border-default);
  min-height: 56px;
}

.logoIcon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent);
  border-radius: 8px;
  color: white;
}

.iconLarge {
  width: 20px;
  height: 20px;
}

.logoText h1 {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.logoText p {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
}

.navGroup {
  padding: 12px 8px;
}

.groupLabel {
  display: block;
  font-size: 10px;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 12px;
  margin-bottom: 8px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: left;
  transition: all 0.15s ease;
}

.navItem:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.navItem.active {
  background-color: var(--accent-light);
  color: var(--accent);
  font-weight: 500;
}

.navItem.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 24px;
  background-color: var(--accent);
  border-radius: 0 2px 2px 0;
}

.isCollapsedIcon {
  justify-content: center;
}

.isCollapsedIcon span {
  display: none;
}

.collapseContainer {
  margin-top: auto;
  padding: 12px;
  border-top: 1px solid var(--border-default);
}

.collapseButton {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-tertiary);
  font-size: 13px;
  transition: all 0.15s ease;
}

.collapseButton:hover {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.collapseText {
  display: none;
}

.sidebar:not(.collapsed) .collapseText {
  display: block;
}

.icon {
  width: 16px;
  height: 16px;
}
```

---

## src/components/layout/Header.tsx

```typescript
import { Search, Bell, Plus, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
}

export const Header = ({ title }: HeaderProps) => {
  const { user } = useAuthStore();

  return (
    <header className={styles.header}>
      {/* Left - Breadcrumb */}
      <div className={styles.left}>
        <h2 className={styles.title}>{title || 'Dashboard'}</h2>
      </div>

      {/* Center - Search */}
      <div className={styles.center}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar contactos, oportunidades..."
            className={styles.searchInput}
          />
          <span className={styles.searchShortcut}>⌘K</span>
        </div>
      </div>

      {/* Right - Actions */}
      <div className={styles.right}>
        <button className={styles.iconButton} title="Notificaciones">
          <Bell />
          <span className={styles.badge}>3</span>
        </button>
        <button className={styles.iconButton} title="Ayuda">
          <HelpCircle />
        </button>
        <button className={styles.newButton}>
          <Plus />
          <span>Nuevo</span>
        </button>
        <div className={styles.userAvatar}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span>{user?.name?.charAt(0) || 'U'}</span>
          )}
        </div>
      </div>
    </header>
  );
};
```

---

## src/components/layout/Header.module.css

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background-color: var(--bg-sidebar);
  border-bottom: 1px solid var(--border-default);
  position: sticky;
  top: 0;
  z-index: 50;
}

.left {
  flex: 1;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.searchContainer {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
  background-color: var(--bg-secondary);
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 0 12px;
  transition: all 0.15s ease;
}

.searchContainer:focus-within {
  background-color: white;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.searchIcon {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
}

.searchInput {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
}

.searchInput::placeholder {
  color: var(--text-tertiary);
}

.searchShortcut {
  font-size: 11px;
  color: var(--text-tertiary);
  background-color: var(--bg-page);
  padding: 2px 6px;
  border-radius: 4px;
}

.right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.iconButton {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.15s ease;
}

.iconButton:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  background-color: var(--danger);
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.newButton {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.newButton:hover {
  background-color: var(--accent-hover);
}

.userAvatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.userAvatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
```