import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Welcome | Assessment Invitation",
  description: "You have been invited to complete an assessment",
};

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InviteLandingPage({ params }: InvitePageProps) {
  const { token } = await params;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <ClipboardCheck className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
        
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          You have been invited to complete an assessment. This assessment will help evaluate your skills and provide valuable feedback.
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <h3 className="font-semibold mb-2">What to expect:</h3>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2 text-left">
              <li>• The assessment takes approximately 15-20 minutes</li>
              <li>• Answer all questions honestly and thoughtfully</li>
              <li>• Your responses are confidential</li>
              <li>• You will receive feedback upon completion</li>
            </ul>
          </div>

          <Link href={`/invite/${token}/assessment`}>
            <Button size="lg" className="w-full">
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
