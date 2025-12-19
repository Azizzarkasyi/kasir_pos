import { AntDesign } from "@expo/vector-icons";

export type DashboardMenuKey =
  | "dashboard"
  | "profile"
  | "products"
  | "categories"
  | "customers"
  | "suppliers"
  | "transaction"
  | "history"
  | "reports"
  | "employees"
  | "outlets"
  | "settings"
  | "scanner"
  | "receipt"
  | "printer"
  | "help"
  | "bio-link"
  | "stock-history";

export type DashboardMenuItem = {
  key: DashboardMenuKey;
  label: string;
  icon: React.ComponentProps<typeof AntDesign>["name"];
  permissionKey?: string;
};

export const DASHBOARD_MENU_ITEMS: DashboardMenuItem[] = [
  { key: "dashboard", label: "Beranda", icon: "home", permissionKey: "dashboard" },
  { key: "transaction", label: "Transaksi", icon: "swap", permissionKey: "transaction" },
  { key: "history", label: "Riwayat Transaksi", icon: "profile", permissionKey: "reports" },
  { key: "reports", label: "Laporan", icon: "bar-chart", permissionKey: "reports" },
  { key: "products", label: "Kelola Produk", icon: "appstore", permissionKey: "products" },
  { key: "stock-history", label: "Perputaran Stock", icon: "sync" },
  { key: "employees", label: "Pegawai", icon: "team", permissionKey: "employees" },
  { key: "outlets", label: "Outlet", icon: "shop", permissionKey: "outlets" },
  { key: "bio-link", label: "Bio Link", icon: "global" },
  { key: "settings", label: "Pengaturan", icon: "setting", permissionKey: "settings" },
  { key: "help", label: "Bantuan", icon: "question-circle" },
];

export const getDashboardRouteForKey = (key: DashboardMenuKey): string | null => {
  switch (key) {
    case "dashboard":
      return "/dashboard/home";
    case "profile":
      return "/dashboard/setting/profile";
    case "products":
      return "/dashboard/product/manage";
    case "categories":
      return "/dashboard/category/manage";
    case "customers":
      return "/dashboard/customer/manage";
    case "suppliers":
      return "/dashboard/supplier/manage";
    case "transaction":
      return "/dashboard/transaction";
    case "history":
      return "/dashboard/transaction/history";
    case "reports":
      return "/dashboard/reports";
    case "employees":
      return "/dashboard/employee";
    case "outlets":
      return "/dashboard/select-branch";
    case "settings":
      return "/dashboard/setting";
    case "scanner":
      return "/dashboard/setting/scanner";
    case "receipt":
      return "/dashboard/setting/order-receipt";
    case "printer":
      return "/dashboard/setting/printer";
    case "help":
      return "/dashboard/help";
    case "stock-history":
      return "/dashboard/stock-history";
    default:
      return null;
  }
};
