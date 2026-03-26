import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { CheckCircle, Download, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Feedback | Assessment Complete",
  description: "Your assessment results and feedback",
};

interface FeedbackPageProps {
  params: Promise<{ token: string }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { token } = await params;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Assessment Complete!</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Thank you for completing the assessment. Here is your feedback.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <h2 className="font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Overall Score
            </h2>
            <div className="text-4xl font-bold text-primary mb-2">85/100</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Great job! Your responses indicate strong abilities in most areas.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="font-semibold mb-4">Key Strengths</h2>
            <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Strong communication skills
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Excellent problem-solving approach
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Good teamwork abilities
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="font-semibold mb-4">Areas for Development</h2>
            <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>• Consider developing leadership skills</li>
              <li>• Continue building technical expertise</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
