import { Route, Routes } from "react-router-dom";
import App from "@/App";
import Dashboard from "@/pages/Dashboard";
import { NotFound } from "@/pages/NotFound";
import Products from "@/pages/Products";

export const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};
