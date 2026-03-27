import { Button } from "@/components/ui/button";
import { validateInviteToken, markParticipantOpened } from "@/lib/queries/invites";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, Calendar, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Welcome | ScorePrompt Assessment",
  description: "You have been invited to complete an AI literacy assessment",
};

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function InviteLandingPage({ params }: InvitePageProps) {
  const { token } = await params;

  const participant = await validateInviteToken(token);

  if (!participant) {
    redirect('/invite/invalid');
  }

  if (participant.status === 'invited') {
    await markParticipantOpened(participant.id);
  }

  const { campaign } = participant;
  const deadlineText = campaign.deadline 
    ? `Please complete by ${formatDate(campaign.deadline)}.` 
    : '';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <ClipboardCheck className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
          You've been invited to complete an AI literacy assessment.
        </p>

        <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800 p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-lg font-semibold mb-2">
            <Building2 className="w-5 h-5" />
            {campaign.name}
          </div>
          {campaign.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              {campaign.description}
            </p>
          )}
          {campaign.deadline && (
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
              <Calendar className="w-4 h-4" />
              Deadline: {formatDate(campaign.deadline)}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-left">
            <h3 className="font-semibold mb-2">What to expect:</h3>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
              <li>• The assessment takes approximately 15-20 minutes</li>
              <li>• You'll complete 5 AI prompting scenarios</li>
              <li>• Answer thoughtfully - there are no trick questions</li>
              <li>• You'll receive personalized feedback upon completion</li>
            </ul>
          </div>

          {deadlineText && (
            <p className="text-sm text-amber-600 dark:text-amber-500 font-medium">
              {deadlineText}
            </p>
          )}

          <Link href={`/invite/${token}/assessment`}>
            <Button size="lg" className="w-full">
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-center text-sm text-neutral-500 mt-6">
        This assessment is powered by ScorePrompt.
      </p>
    </div>
  );
}
