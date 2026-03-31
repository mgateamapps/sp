import {
  ChartPie,
  House,
  Settings,
  Users,
  FolderKanban,
  Wallet
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

 
    // {
    //   label: "UI Elements",
    // },
    // {
    //   title: "Components",
    //   url: "#",
    //   icon: Component,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Typography",
    //       url: "/typography",
    //       circleColor: "bg-primary",
    //     },
    //     {
    //       title: "Colors",
    //       url: "/colors",
    //       circleColor: "bg-yellow-500",
    //     },
    //     {
    //       title: "Buttons",
    //       url: "/buttons",
    //       circleColor: "bg-green-600",
    //     },
    //     {
    //       title: "Dropdown",
    //       url: "/dropdown",
    //       circleColor: "bg-purple-600",
    //     },
    //     {
    //       title: "Alert",
    //       url: "/alert",
    //       circleColor: "bg-yellow-500",
    //     },
    //     {
    //       title: "Card",
    //       url: "/card",
    //       circleColor: "bg-red-600",
    //     },
    //     {
    //       title: "Avatar",
    //       url: "/avatar",
    //       circleColor: "bg-green-600",
    //     },
    //     {
    //       title: "Progress Bar",
    //       url: "/progress-bar",
    //       circleColor: "bg-primary",
    //     },
    //     {
    //       title: "Tab & Accordion",
    //       url: "/tab-accordion",
    //       circleColor: "bg-yellow-500",
    //     },
    //     {
    //       title: "Pagination",
    //       url: "/pagination",
    //       circleColor: "bg-red-600",
    //     },
    //     {
    //       title: "Badges",
    //       url: "/badge",
    //       circleColor: "bg-primary",
    //     },
    //     {
    //       title: "Tooltip & Popover",
    //       url: "/tooltip",
    //       circleColor: "bg-slate-900",
    //     },
    //     {
    //       title: "Star Ratings",
    //       url: "/star-rating",
    //       circleColor: "bg-purple-600",
    //     },
    //     {
    //       title: "Tags",
    //       url: "/tags",
    //       circleColor: "bg-primary",
    //     },
    //     {
    //       title: "List",
    //       url: "/list",
    //       circleColor: "bg-red-600",
    //     },
    //     {
    //       title: "Radio",
    //       url: "/radio",
    //       circleColor: "bg-orange-600",
    //     },
    //     {
    //       title: "Switch",
    //       url: "/switch",
    //       circleColor: "bg-green-600",
    //     },
    //   ],
    // },
    // {
    //   title: "Forms",
    //   url: "#",
    //   icon: StickyNote,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Input Forms",
    //       url: "/input-forms",
    //       circleColor: "bg-primary",
    //     },
    //     {
    //       title: "Input Layout",
    //       url: "/input-layout",
    //       circleColor: "bg-yellow-500",
    //     },
    //     {
    //       title: "Form Validation",
    //       url: "/form-validation",
    //       circleColor: "bg-green-600",
    //     },
    //   ],
    // },
    // {
    //   title: "Chart",
    //   url: "#",
    //   icon: ChartPie,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Line Chart",
    //       url: "/line-chart",
    //       circleColor: "bg-orange-600",
    //     },
    //     {
    //       title: "Column Chart",
    //       url: "/column-chart",
    //       circleColor: "bg-yellow-500",
    //     },
    //     {
    //       title: "Pie Chart",
    //       url: "/pie-chart",
    //       circleColor: "bg-green-600",
    //     },
    //   ],
    // },
    // {
    //   title: "Widgets",
    //   url: "/widgets",
    //   icon: Boxes,
    // },
    // {
    //   title: "Table",
    //   url: "#",
    //   icon: Server,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Basic Table",
    //       url: "/basic-table",
    //       circleColor: "bg-orange-600",
    //     },
    //   ],
    // },
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
