import { validateInviteToken } from '@/lib/queries/invites';
import { getOrCreateAttempt } from '@/lib/actions/assessment';
import { getAttemptWithResponses } from '@/lib/queries/assessment';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AssessmentForm } from './assessment-form';

export const metadata: Metadata = {
  title: 'Assessment | ScorePrompt',
  description: 'Complete your AI literacy assessment',
};

interface AssessmentPageProps {
  params: Promise<{ token: string }>;
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { token } = await params;

  const participant = await validateInviteToken(token);

  if (!participant) {
    redirect('/invite/invalid');
  }

  if (participant.status === 'completed') {
    redirect(`/invite/${token}/processing`);
  }

  const { attempt, error } = await getOrCreateAttempt(participant.id);

  if (error || !attempt) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-8 text-center">
          <h1 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Unable to Start Assessment
          </h1>
          <p className="text-red-600 dark:text-red-400">
            {error || 'An unexpected error occurred. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  if (attempt.status === 'submitted' || attempt.status === 'scored') {
    redirect(`/invite/${token}/processing`);
  }

  const attemptWithResponses = await getAttemptWithResponses(participant.id);

  return (
    <AssessmentForm
      token={token}
      attemptId={attempt.id}
      initialResponses={attemptWithResponses?.responses || {}}
      campaignName={participant.campaign.name}
    />
  );
}
