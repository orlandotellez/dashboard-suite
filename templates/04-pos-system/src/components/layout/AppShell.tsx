import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { ScanBarcode, Package, BarChart3, Settings, Boxes, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import styles from "./AppShell.module.css";

const navItems = [
  { to: "/pos", label: "Venta", icon: ScanBarcode },
  { to: "/products", label: "Productos", icon: Package },
  { to: "/inventory", label: "Inventario", icon: Boxes },
  { to: "/reports", label: "Reportes", icon: BarChart3 },
  { to: "/settings", label: "Ajustes", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className={styles.shell}>
      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoText}>Caja</div>
          <div className={styles.logoRole}>Administrador</div>
        </div>
        <nav className={styles.nav}>
          {navItems.map((it) => {
            const Icon = it.icon;
            const active = pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
              >
                <Icon className={styles.navIcon} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.footerUser}>admin@smart-miscelanea.com</div>
          <button className={styles.signOut}>
            <LogOut className={styles.navIcon} />
            Salir
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className={styles.mobileNav}>
        {navItems.map((it) => {
          const Icon = it.icon;
          const active = pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`${styles.mobileNavItem} ${active ? styles.mobileNavItemActive : ""}`}
            >
              <Icon className={styles.mobileNavIcon} />
              {it.label}
            </Link>
          );
        })}
        <button onClick={toggle} className={styles.mobileNavItem}>
          {theme === "dark" ? <Sun className={styles.mobileNavIcon} /> : <Moon className={styles.mobileNavIcon} />}
        </button>
      </nav>

      <main className={styles.main}>{children}</main>

      {/* Theme toggle fab for desktop */}
      <button onClick={toggle} className={styles.themeToggle}>
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
