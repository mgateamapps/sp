import Link from "next/link";
import { cn } from "@/lib/utils";

type CampaignDetailTab = "overview" | "participants" | "analysis" | "export";

const TABS: Array<{ key: CampaignDetailTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "participants", label: "Participants" },
  { key: "analysis", label: "Analysis" },
  { key: "export", label: "Export" },
];

interface CampaignDetailTabsProps {
  campaignId: string;
  activeTab: CampaignDetailTab;
}

export function CampaignDetailTabs({
  campaignId,
  activeTab,
}: CampaignDetailTabsProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/app/campaigns/${campaignId}?tab=${tab.key}`}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeTab === tab.key
              ? "bg-primary text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
