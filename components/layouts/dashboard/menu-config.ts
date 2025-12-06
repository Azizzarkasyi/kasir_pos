import { AntDesign } from "@expo/vector-icons";

export type DashboardMenuKey =
  | "home"
  | "profile"
  | "products"
  | "transactions"
  | "history"
  | "outlet"
  | "employees"
  | "settings"
  | "help";

export type DashboardMenuItem = {
  key: DashboardMenuKey;
  label: string;
  icon: React.ComponentProps<typeof AntDesign>["name"];
};

export const DASHBOARD_MENU_ITEMS: DashboardMenuItem[] = [
  { key: "home", label: "Beranda", icon: "home" },
  { key: "profile", label: "Profil", icon: "user" },
  { key: "products", label: "Kelola Produk", icon: "appstore" },
  { key: "transactions", label: "Transaksi", icon: "swap" },
  { key: "history", label: "Riwayat Transaksi", icon: "profile" },
  { key: "outlet", label: "Outlet", icon: "shop" },
  { key: "employees", label: "Pegawai", icon: "team" },
  { key: "settings", label: "Pengaturan", icon: "setting" },
  { key: "help", label: "Bantuan", icon: "question-circle" },
];

export const getDashboardRouteForKey = (key: DashboardMenuKey): string | null => {
  switch (key) {
    case "home":
      return "/dashboard/home";
    case "profile":
      return "/dashboard/setting/profile";
    case "products":
      return "/dashboard/product/manage";
    case "transactions":
      return "/dashboard/transaction";
    case "history":
      return "/dashboard/transaction/history";
    case "outlet":
      return "/dashboard/select-branch";
    case "employees":
      return "/dashboard/employee";
    case "settings":
      return "/dashboard/setting";
    case "help":
      return "/dashboard/help";
    default:
      return null;
  }
};
