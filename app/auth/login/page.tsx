import LoginForm from "@/components/auth/login-form";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Target, Users, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Log In | ScorePrompt",
  description: "Log in to access your team's AI literacy assessments, campaign results, and company insights.",
};

export default function LoginPage() {
  return (
    <section className="bg-white dark:bg-neutral-950 flex flex-wrap min-h-screen">
      {/* Left Promo Panel */}
      <div className="lg:w-1/2 hidden lg:flex items-center justify-center bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="px-12 xl:px-16 py-12 w-full max-w-xl relative z-10">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full mb-4">
              AI Literacy Assessment
            </span>
            <h2 className="text-3xl xl:text-4xl font-bold mb-4 text-white leading-tight">
              Measure real AI<br />prompting skill
            </h2>
            <p className="text-slate-400 text-lg">
              Get structured insights into how your team actually uses AI tools.
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            {[
              { text: "Assess with 5 practical scenarios", icon: Target },
              { text: "See structured scores and feedback", icon: BarChart3 },
              { text: "Track weak areas across the company", icon: Users },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-slate-200">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">68</div>
                <div className="text-xs text-slate-400">Avg. score</div>
              </div>
              <div className="text-center border-x border-white/10">
                <div className="text-2xl font-bold text-white">86%</div>
                <div className="text-xs text-slate-400">Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">!</div>
                <div className="text-xs text-slate-400">Gaps found</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Example dashboard metrics
            </p>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="lg:w-1/2 w-full py-8 px-6 flex flex-col justify-center">
        <div className="lg:max-w-[440px] w-full mx-auto">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/assets/images/logo.png"
                alt="ScorePrompt"
                width={150}
                height={28}
                priority
              />
            </Link>

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
