import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Truck,
  Users,
  FileText,
  Settings,
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

export const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Package, label: "Productos", path: "/products" },
  { icon: ArrowLeftRight, label: "Movimientos", path: "/movements" },
  { icon: Truck, label: "Proveedores", path: "/suppliers" },
  { icon: Users, label: "Usuarios", path: "/users" },
  { icon: FileText, label: "Reportes", path: "/reports" },
  { icon: Settings, label: "Configuración", path: "/settings" },
];
