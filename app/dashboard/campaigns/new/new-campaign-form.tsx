'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCampaign } from "@/lib/actions/campaigns";
import { DOMAIN_LABELS, SCENARIOS_BY_DOMAIN } from "@/lib/constants/assessment";
import type { CampaignDomain } from "@/types";
import { Loader2, Mail, ClipboardCheck, BarChart3, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const DOMAIN_OPTIONS: CampaignDomain[] = [
  'marketing',
  'sales',
  'support',
  'product',
  'engineering',
  'hr',
  'operations',
  'finance',
  'consulting',
  'management',
  'other',
];

function ScenarioPreview({ domain }: { domain: CampaignDomain }) {
  const scenarios = SCENARIOS_BY_DOMAIN[domain] ?? [];

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Scenarios for {DOMAIN_LABELS[domain]} teams
          </p>
          <p className="text-xs text-neutral-500">{scenarios.length} scenarios · sent to every participant</p>
        </div>
      </div>

      <ol className="space-y-3">
        {scenarios.map((scenario, i) => (
          <li key={scenario.key} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium leading-snug text-neutral-800 dark:text-neutral-200">
                {scenario.title}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                {scenario.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function NewCampaignForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domain, setDomain] = useState<CampaignDomain>('other');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('domain', domain);
      const result = await createCampaign(formData);

      if (result.success && result.campaignId) {
        toast.success('Campaign created successfully!');
        router.push(`/dashboard/campaigns/${result.campaignId}`);
      } else {
        toast.error(result.error || 'Failed to create campaign');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8">
        <h1 className="text-2xl font-bold mb-2">Create New Campaign</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
          Fill in the details below to launch a new AI literacy assessment.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Q1 AI Literacy Assessment"
              required
              minLength={2}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Team Domain *</Label>
            <Select
              value={domain}
              onValueChange={(v) => setDomain(v as CampaignDomain)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="domain">
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {DOMAIN_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {DOMAIN_LABELS[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-neutral-500">
              Scenarios are tailored to your team's domain for a more relevant assessment.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Optional description for this campaign"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              disabled={isSubmitting}
            />
            <p className="text-sm text-neutral-500">
              Optional. Set a deadline for employees to complete the assessment.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emails">Employee Emails *</Label>
            <Textarea
              id="emails"
              name="emails"
              placeholder="Enter email addresses (one per line, or separated by commas)"
              rows={6}
              required
              disabled={isSubmitting}
            />
            <p className="text-sm text-neutral-500">
              Enter email addresses of employees to invite. Duplicates will be automatically removed.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
            <Link href="/dashboard/campaigns">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        <ScenarioPreview domain={domain} />

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <div className="space-y-5">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Invites sent automatically</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Each employee receives a unique assessment link by email.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">No employee account needed</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Employees complete the assessment directly from their email link.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Results appear in real time</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Scores and insights update as employees complete the assessment.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
            <li className="flex gap-2"><span className="text-primary font-bold">·</span> Use a clear name so you can identify the campaign later (e.g. "Q2 2025 – Engineering").</li>
            <li className="flex gap-2"><span className="text-primary font-bold">·</span> Set a deadline to increase completion rates.</li>
            <li className="flex gap-2"><span className="text-primary font-bold">·</span> You can add more employees after creating the campaign.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
