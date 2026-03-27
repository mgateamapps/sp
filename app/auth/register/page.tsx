import RegisterForm from "@/components/auth/register-form";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Mail, BarChart3, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account | ScorePrompt",
  description: "Set up your company workspace and start measuring AI prompt-writing capability across your team.",
};

export default function RegisterPage() {
  return (
    <section className="bg-white dark:bg-neutral-950 flex flex-wrap min-h-screen">
      {/* Left Promo Panel */}
      <div className="lg:w-1/2 hidden lg:flex bg-neutral-50 dark:bg-neutral-900">
        <div className="flex flex-col justify-center px-12 xl:px-20 py-12 w-full">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
              Start with a clear baseline
            </h2>
            
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Launch an assessment campaign, invite employees by email, and get structured results in one management dashboard.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Simple setup",
                "Individual employee feedback",
                "Company-wide visibility",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-neutral-600 dark:text-neutral-400">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Invite by email</div>
                      <div className="text-xs text-neutral-500">No employee accounts needed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Structured scoring</div>
                      <div className="text-xs text-neutral-500">5 criteria per scenario</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Team insights</div>
                      <div className="text-xs text-neutral-500">Common weaknesses at a glance</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="lg:w-1/2 w-full py-8 px-6 flex flex-col justify-center">
        <div className="lg:max-w-[440px] w-full mx-auto">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-bold text-primary inline-block mb-6">
              ScorePrompt
            </Link>

            <h1 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">
              Create your ScorePrompt account
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Set up your company workspace and start measuring AI prompt-writing capability across your team.
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </section>
  );
}
