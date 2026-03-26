import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Employee Assessment | Admin Panel",
  description: "View employee assessment results",
};

interface EmployeePageProps {
  params: Promise<{ campaignId: string; employeeId: string }>;
}

export default async function EmployeeAssessmentPage({ params }: EmployeePageProps) {
  const { campaignId, employeeId } = await params;

  return (
    <>
      <DashboardBreadcrumb 
        title="Employee Assessment" 
        text={`Campaigns / ${campaignId} / Employees / ${employeeId}`} 
      />

      <div className="mb-6">
        <Link 
          href={`/app/campaigns/${campaignId}`} 
          className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">Employee: {employeeId}</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Assessment results and details</p>
          </div>

          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Assessment Results
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <p className="text-neutral-600 dark:text-neutral-400">
                  Assessment results will be displayed here once the employee completes the assessment.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
            <h3 className="font-semibold mb-4">Status</h3>
            <div className="flex items-center text-yellow-600 dark:text-yellow-500">
              <Clock className="w-5 h-5 mr-2" />
              Pending
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">Send Reminder</Button>
              <Button className="w-full" variant="outline">Resend Invite</Button>
              <Button className="w-full" variant="destructive">Remove from Campaign</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
