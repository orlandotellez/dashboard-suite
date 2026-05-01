import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeWrapper } from "./ThemeWrapper";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ThemeWrapper>
          <AppRoutes />
        </ThemeWrapper>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
