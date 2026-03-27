import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import { getCampaignWithStats, getCampaignParticipants } from "@/lib/queries/campaigns";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Mail, Users, CheckCircle, Clock, Send } from "lucide-react";
import { redirect, notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Campaign Details | ScorePrompt",
  description: "View campaign details and participants",
};

interface CampaignPageProps {
  params: Promise<{ campaignId: string }>;
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case 'active':
      return 'default';
    case 'closed':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getParticipantStatusBadge(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case 'completed':
      return 'default';
    case 'started':
      return 'secondary';
    default:
      return 'outline';
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function CampaignDetailPage({ params }: CampaignPageProps) {
  const { campaignId } = await params;
  
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  const campaign = await getCampaignWithStats(campaignId);
  if (!campaign) {
    notFound();
  }

  if (campaign.organization_id !== admin.organization_id) {
    notFound();
  }

  const participants = await getCampaignParticipants(campaignId);
  const completionRate = campaign.participant_count > 0
    ? Math.round((campaign.completed_count / campaign.participant_count) * 100)
    : 0;

  return (
    <>
      <DashboardBreadcrumb title="Campaign Details" text={`Campaigns / ${campaign.name}`} />

      <div className="mb-6">
        <Link href="/app/campaigns" className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Link>
      </div>

      {/* Campaign Header */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <Badge variant={getStatusBadgeVariant(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {campaign.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {formatDate(campaign.created_at)}
              </span>
              {campaign.deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Deadline: {formatDate(campaign.deadline)}
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" disabled>
            <Send className="w-4 h-4 mr-2" />
            Send Invites
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Invited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-neutral-400" />
              <span className="text-2xl font-bold">{campaign.participant_count}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">{campaign.started_count}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">{campaign.completed_count}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{completionRate}%</span>
          </CardContent>
        </Card>
      </div>

      {/* Participants Table */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Participants ({participants.length})
          </h2>
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-neutral-600 dark:text-neutral-400">
              No participants in this campaign yet.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">
                    {participant.employee.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getParticipantStatusBadge(participant.status)}>
                      {participant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-600 dark:text-neutral-400">
                    {formatDateTime(participant.invited_at)}
                  </TableCell>
                  <TableCell className="text-neutral-600 dark:text-neutral-400">
                    {formatDateTime(participant.started_at)}
                  </TableCell>
                  <TableCell className="text-neutral-600 dark:text-neutral-400">
                    {formatDateTime(participant.completed_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
