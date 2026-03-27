import LoginForm from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import { Target, Users, AlertTriangle, BarChart3, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Log In | ScorePrompt",
  description: "Log in to access your team's AI literacy assessments, campaign results, and company insights.",
};

export default function LoginPage() {
  return (
    <section className="bg-white dark:bg-neutral-950 flex flex-wrap min-h-screen">
      {/* Left Promo Panel */}
      <div className="lg:w-1/2 hidden lg:flex bg-neutral-50 dark:bg-neutral-900">
        <div className="flex flex-col justify-center px-12 xl:px-20 py-12 w-full">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
              Measure real AI prompting skill
            </h2>
            
            <ul className="space-y-3 mb-8">
              {[
                "Assess employees with 5 practical scenarios",
                "See structured scores and feedback",
                "Track weak areas across the company",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-neutral-600 dark:text-neutral-400">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-xl font-bold">68/100</div>
                    <div className="text-xs text-neutral-500">Avg. score</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-xl font-bold">86%</div>
                    <div className="text-xs text-neutral-500">Completion</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-sm font-semibold text-amber-600">Verification</div>
                    <div className="text-xs text-neutral-500">Weakest area</div>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 text-center">
                  See participation, scores, and feedback across your team
                </p>
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
              Welcome back
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Log in to access your team's AI literacy assessments, campaign results, and company insights.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </section>
  );
}
