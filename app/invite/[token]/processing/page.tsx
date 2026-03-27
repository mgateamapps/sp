import { validateInviteToken } from '@/lib/queries/invites';
import { getAttemptByParticipantId } from '@/lib/queries/assessment';
import { scoreAttempt } from '@/lib/scoring';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Processing | ScorePrompt',
  description: 'Your assessment is being processed',
};

interface ProcessingPageProps {
  params: Promise<{ token: string }>;
}

export default async function ProcessingPage({ params }: ProcessingPageProps) {
  const { token } = await params;

  const participant = await validateInviteToken(token);

  if (!participant) {
    redirect('/invite/invalid');
  }

  const attempt = await getAttemptByParticipantId(participant.id);

  if (!attempt) {
    redirect(`/invite/${token}`);
  }

  if (attempt.status === 'submitted') {
    const result = await scoreAttempt(attempt.id);
    if (result.success) {
      redirect(`/invite/${token}/feedback`);
    }
  }

  if (attempt.status === 'scored') {
    redirect(`/invite/${token}/feedback`);
  }

  const isFailed = attempt.status === 'failed';
  const isInProgress = attempt.status === 'in_progress';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 text-center">
        {isFailed ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-2xl font-bold mb-4">Processing Error</h1>

            <p className="text-neutral-600 dark:text-neutral-400">
              There was an issue processing your assessment. Please contact your
              administrator for assistance.
            </p>
          </>
        ) : isInProgress ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>

            <h1 className="text-2xl font-bold mb-4">Assessment Not Submitted</h1>

            <p className="text-neutral-600 dark:text-neutral-400">
              Your assessment has not been submitted yet. Please complete all
              scenarios and submit your responses.
            </p>
          </>
        ) : (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />

            <h1 className="text-2xl font-bold mb-4">
              Processing Your Assessment
            </h1>

            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Please wait while we analyze your responses...
            </p>

            <div className="space-y-2 text-sm text-neutral-500">
              <p>Analyzing responses...</p>
              <p>Generating feedback...</p>
            </div>
          </>
        )}
      </div>

      <p className="text-center text-sm text-neutral-500 mt-6">
        Powered by ScorePrompt
      </p>
    </div>
  );
}
