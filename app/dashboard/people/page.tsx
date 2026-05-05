import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterSelect } from "@/components/ui/filter-select";
import { Pagination } from "@/components/ui/pagination";
import { SearchableContent } from "@/components/ui/searchable-content";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import {
  getCampaignsForOrganization,
  getOrganizationParticipantsPaginated,
} from "@/lib/queries/campaigns";
import {
  formatBandLabel,
  formatDate,
  getBandVariant,
  getParticipantStatusBadge,
} from "@/lib/utils/formatting";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Download, Users } from "lucide-react";
import { ParticipantTableRowActions } from "./participant-table-row-actions";

export const metadata: Metadata = {
  title: "Participants | ScorePrompt",
  description: "Global participant lookup, completion status, and results",
};

const PAGE_SIZE = 20;

interface ParticipantsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    campaign?: string;
    status?: string;
    band?: string;
    weakest?: string;
  }>;
}

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function ParticipantsPage({ searchParams }: ParticipantsPageProps) {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect("/auth/login");
  }

  const {
    page: pageParam,
    search = "",
    campaign = "",
    status = "",
    band = "",
    weakest = "",
  } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [{ participants, total }, campaignsData] = await Promise.all([
    getOrganizationParticipantsPaginated(admin.organization_id, {
      page,
      pageSize: PAGE_SIZE,
      search,
      campaign,
      status,
      band,
      weakest,
    }),
    getCampaignsForOrganization(admin.organization_id, { page: 1, pageSize: 200 }),
  ]);

  const isEmpty =
    total === 0 && !search && !campaign && !status && !band && !weakest;
  const hasActiveFilters = Boolean(search || campaign || status || band || weakest);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Participants</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Search, filter, and review participant results across campaigns.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <h2 className="text-lg font-semibold mb-2">No participants found</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Try changing your filters or launch a new campaign.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <SearchableContent
            placeholder="Search by Name or Email"
            header={
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-neutral-500 shrink-0">
                  {total} participant{total !== 1 ? "s" : ""}
                </p>
                <FilterSelect
                  param="campaign"
                  placeholder="All campaigns"
                  options={campaignsData.campaigns.map((entry) => ({
                    value: entry.id,
                    label: entry.name,
                  }))}
                />
                <FilterSelect
                  param="status"
                  placeholder="All statuses"
                  options={[
                    { value: "invited", label: "Invited" },
                    { value: "opened", label: "Opened" },
                    { value: "started", label: "Started" },
                    { value: "completed", label: "Completed" },
                  ]}
                />
                <FilterSelect
                  param="band"
                  placeholder="Score Band"
                  options={[
                    { value: "at_risk", label: "At Risk" },
                    { value: "basic", label: "Basic" },
                    { value: "functional", label: "Functional" },
                    { value: "strong", label: "Strong" },
                    { value: "expert", label: "Expert" },
                  ]}
                />
                <FilterSelect
                  param="weakest"
                  placeholder="Weakest Criterion"
                  options={[
                    { value: "clarity", label: "Clarity" },
                    { value: "context", label: "Context" },
                    { value: "constraints", label: "Constraints" },
                    { value: "output_format", label: "Output Format" },
                    { value: "verification", label: "Verification" },
                  ]}
                />
              </div>
            }
          >
            {participants.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <p className="font-medium">No participants found</p>
                <p className="text-sm mt-1">
                  {hasActiveFilters
                    ? "Try changing your filters or launch a new campaign."
                    : `No participants match “${search}”.`}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                        <th className="text-left py-3 px-4 font-medium">Participant</th>
                        <th className="text-left py-3 px-4 font-medium">Campaign</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Completed</th>
                        <th className="text-right py-3 px-4 font-medium">Score</th>
                        <th className="text-left py-3 px-4 font-medium">Score Band</th>
                        <th className="text-left py-3 px-4 font-medium">Weakest Criterion</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant) => (
                        <tr
                          key={participant.id}
                          className="border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                        >
                          <td className="py-3 px-4">
                            <div className="min-w-[220px]">
                              <p className="font-medium">
                                {participant.employee.full_name || "Participant"}
                              </p>
                              <p className="text-neutral-500">{participant.employee.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">{participant.campaign_name ?? "—"}</td>
                          <td className="py-3 px-4">
                            <Badge variant={getParticipantStatusBadge(participant.status)}>
                              {formatStatusLabel(participant.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{formatDate(participant.completed_at)}</td>
                          <td className="py-3 px-4 text-right">
                            {participant.score ? participant.score.total_score : "—"}
                          </td>
                          <td className="py-3 px-4">
                            {participant.score ? (
                              <Badge variant={getBandVariant(participant.score.score_band)}>
                                {formatBandLabel(participant.score.score_band)}
                              </Badge>
                            ) : (
                              <span className="text-neutral-500">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {participant.weakest_criterion ?? "—"}
                          </td>
                          <td className="py-3 px-4">
                            <ParticipantTableRowActions
                              campaignId={participant.campaign_id}
                              participantId={participant.id}
                              canResend={participant.status !== "completed"}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={page}
                  total={total}
                  pageSize={PAGE_SIZE}
                  basePath="/app/participants"
                  searchParams={{
                    ...(search ? { search } : {}),
                    ...(campaign ? { campaign } : {}),
                    ...(status ? { status } : {}),
                    ...(band ? { band } : {}),
                    ...(weakest ? { weakest } : {}),
                  }}
                />
              </>
            )}
          </SearchableContent>
        </div>
      )}
    </>
  );
}
