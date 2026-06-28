import { IconTheme } from "../common/IconTheme";
import styles from "./Header.module.css";

export const Header = () => {
  return (
    <>
      <header className={styles.header}>
        <IconTheme />
      </header>
    </>
  );
};
