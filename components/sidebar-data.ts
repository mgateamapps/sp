import {
  Settings,
  FolderKanban,
  Wallet,
  Users,
  BarChart3,
} from "lucide-react";

export const data = {
  navMain: [
    {
      title: "Campaigns",
      url: "/app/campaigns",
      icon: FolderKanban,
      isActive: true,
    },
    {
      title: "Summary",
      url: "/app/summary",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Participants",
      url: "/app/participants",
      icon: Users,
      isActive: true,
    },
    {
      title: "Billing",
      url: "/app/billing",
      icon: Wallet,
      isActive: true,
    },
    {
      title: "Settings",
      url: "/app/settings",
      icon: Settings,
      isActive: true,
    },
  ],
};
