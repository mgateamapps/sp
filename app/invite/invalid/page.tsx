import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Invalid Link | Assessment",
  description: "This invitation link is invalid or has expired",
};

export default function InvalidInvitePage() {
  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Invalid Invitation</h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          This invitation link is invalid or has expired. Please contact your administrator for a new invitation.
        </p>

        <div className="space-y-3">
          <p className="text-sm text-neutral-500">
            Common reasons for invalid links:
          </p>
          <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 text-left">
            <li>• The link has expired</li>
            <li>• The assessment has already been completed</li>
            <li>• The invitation was revoked</li>
            <li>• The link was copied incorrectly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
