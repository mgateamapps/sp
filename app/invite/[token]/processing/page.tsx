"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/invite/${token}/feedback`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, token]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 text-center">
        <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
        
        <h1 className="text-2xl font-bold mb-4">Processing Your Assessment</h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Please wait while we analyze your responses...
        </p>

        <div className="space-y-2 text-sm text-neutral-500">
          <p>Analyzing responses...</p>
          <p>Generating feedback...</p>
        </div>
      </div>
    </div>
  );
}
