'use client';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, FileType2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const EXPORT_SECTIONS = [
  { key: "executive_summary", label: "Executive Summary" },
  { key: "participant_results", label: "Participant Results" },
  { key: "score_distribution", label: "Score Distribution" },
  { key: "criteria_breakdown", label: "Criteria Breakdown" },
  { key: "repeated_weaknesses", label: "Repeated Weaknesses" },
] as const;

export function CampaignExportPanel({ campaignId }: { campaignId: string }) {
  const [selected, setSelected] = useState<string[]>(
    EXPORT_SECTIONS.map((section) => section.key)
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
        <h3 className="font-semibold mb-3">Choose report sections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXPORT_SECTIONS.map((section) => (
            <label key={section.key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selected.includes(section.key)}
                onCheckedChange={(checked) => {
                  setSelected((prev) =>
                    checked
                      ? [...prev, section.key]
                      : prev.filter((item) => item !== section.key)
                  );
                }}
              />
              <span>{section.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-3">
          Section choices are currently saved for UI flow; CSV export includes full report data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">CSV export</h4>
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            Download campaign data now, including participant results and scoring details.
          </p>
          <Link href={`/api/campaigns/${campaignId}/export`}>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileType2 className="w-4 h-4 text-neutral-400" />
            <h4 className="font-semibold">PDF export</h4>
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            Choose this option when PDF export is available.
          </p>
          <Button disabled>
            Export PDF
          </Button>
          <p className="text-xs text-neutral-500 mt-2">PDF export coming soon.</p>
        </div>
      </div>
    </div>
  );
}
