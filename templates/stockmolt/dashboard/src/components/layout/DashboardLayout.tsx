import { SideBar } from "./SideBar";
import styles from "./DashboardLayout.module.css";
import { useSideBarStore } from "@/store/sideBarStore";
import { Header } from "./Header";

interface DashboardLayout {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayout) => {
  const { collapsed } = useSideBarStore();

  return (
    <>
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
          {children}
        </main>
      </div>
    </>
  );
};
