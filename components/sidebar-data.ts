import {
  ChartPie,
  House,
  Settings,
  FolderKanban,
  Wallet,
} from "lucide-react";

export const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: House,
      isActive: true,
    },
    {
      title: "Campaigns",
      url: "/dashboard/campaigns",
      icon: FolderKanban,
      isActive: true,
    },
    {
      title: "Summary",
      url: "/dashboard/summary",
      icon: ChartPie,
      isActive: true,
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: Wallet,
      isActive: true,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      isActive: true,
    },
  ],
};
