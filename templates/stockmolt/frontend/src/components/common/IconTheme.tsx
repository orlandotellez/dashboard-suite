import styles from "./IconTheme.module.css";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export const IconTheme = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <button onClick={toggleTheme} className={styles.buttonTheme}>
        {theme === "light" ? (
          <>
            <Moon color="var(--font-color-title)" />
          </>
        ) : (
          <>
            <Sun color="var(--font-color-title)" />
          </>
        )}
      </button>
    </>
  );
};
