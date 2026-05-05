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
            Included Scenarios
          </p>
          <p className="text-xs text-neutral-500">
            {DOMAIN_LABELS[domain]} domain · {scenarios.length} scenarios
          </p>
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
        router.push(`/app/campaigns/${result.campaignId}`);
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
        <h1 className="text-2xl font-bold mb-2">New Campaign</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
          Set up an assessment campaign and invite participants.
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
            <Label htmlFor="domain">Team or Domain *</Label>
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
            <p className="text-sm text-neutral-500">Scenarios are aligned to this team domain.</p>
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
            <p className="text-sm text-neutral-500">Optional deadline for assessment completion.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessment_type">Assessment Type</Label>
            <Input
              id="assessment_type"
              value="Standard Baseline with Domain Wording"
              readOnly
              className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500"
              disabled
            />
            <p className="text-sm text-neutral-500">
              Available options: Standard Baseline, Standard Baseline with Domain Wording.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emails">Invite Participants *</Label>
            <Textarea
              id="emails"
              name="emails"
              placeholder="Paste one email per line or separate emails with commas"
              rows={6}
              required
              disabled={isSubmitting}
            />
            <p className="text-sm text-neutral-500">
              Paste one email per line or separate emails with commas.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite_message">Custom Invite Message</Label>
            <Textarea
              id="invite_message"
              name="invite_message"
              placeholder="Optional message shown in the invite email."
              rows={3}
              disabled
            />
            <p className="text-sm text-neutral-500">Invite defaults are managed in Settings.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reply_to">Reply-To Email</Label>
              <Input id="reply_to" value="Configured in Settings" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender_name">Sender Name</Label>
              <Input id="sender_name" value="Configured in Settings" disabled />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Draft'
              )}
            </Button>
            <Button type="button" variant="outline" disabled>
              Launch Campaign
            </Button>
            <Link href="/app/campaigns">
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
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Campaign Preview
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Name</span>
              <span className="font-medium">New Campaign</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Team</span>
              <span className="font-medium">{DOMAIN_LABELS[domain]}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Deadline</span>
              <span className="font-medium">Not set</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Assessment Type</span>
              <span className="font-medium">Standard Baseline with Domain Wording</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Invite Count</span>
              <span className="font-medium">Calculated on save</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Estimated Usage</span>
              <span className="font-medium">1 assessment per completion</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Scoring Criteria
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <p>Clarity</p>
            <p>Context</p>
            <p>Constraints</p>
            <p>Output Format</p>
            <p>Verification</p>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Invite Participants
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Each participant receives a unique assessment link.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Usage Guidance
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Usage is counted only when a participant completes the assessment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
