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
import { DOMAIN_LABELS } from "@/lib/constants/assessment";
import type { CampaignDomain } from "@/types";
import { Loader2 } from "lucide-react";
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
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
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
  );
}
