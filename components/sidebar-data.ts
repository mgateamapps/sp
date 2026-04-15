import {
  House,
  Settings,
  FolderKanban,
  Wallet,
  Users,
  BarChart3,
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
      title: "People",
      url: "/dashboard/people",
      icon: Users,
      isActive: true,
    },
    {
      title: "Insights",
      url: "/dashboard/insights",
      icon: BarChart3,
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
