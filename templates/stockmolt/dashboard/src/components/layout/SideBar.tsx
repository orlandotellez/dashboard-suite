import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Box } from "lucide-react";
import { navItems } from "@/routes/NavItems";
import styles from "./SideBar.module.css";
import { useSideBarStore } from "@/store/sideBarStore";

export const SideBar = () => {
  const { collapsed, setCollapsed } = useSideBarStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <aside
        className={`${styles.sidebar} ${
          collapsed ? styles.collapsed : styles.expanded
        }`}
      >
        {/* Logo */}
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <Box className={styles.iconLarge} />
          </div>

          {!collapsed && (
            <div className={styles.logoText}>
              <h1>StockMolt</h1>
              <p>Inventario Inteligente</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`${styles.navItem} ${isActive ? styles.active : ""} ${collapsed ? styles.isCollapsedIcon : ""}`}
              >
                <Icon />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

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
    </>
  );
};
