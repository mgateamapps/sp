import RegisterForm from "@/components/auth/register-form";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Mail, BarChart3, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account | ScorePrompt",
  description: "Set up your company workspace and start measuring AI prompt-writing capability across your team.",
};

export default function RegisterPage() {
  return (
    <section className="bg-white dark:bg-neutral-950 flex flex-wrap min-h-screen">
      {/* Left Promo Panel */}
      <div className="lg:w-1/2 hidden lg:flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="px-12 xl:px-16 py-12 w-full max-w-xl relative z-10">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full mb-4">
              Get Started Free
            </span>
            <h2 className="text-3xl xl:text-4xl font-bold mb-4 text-white leading-tight">
              Start with a clear<br />AI literacy baseline
            </h2>
            <p className="text-slate-400 text-lg">
              Launch assessments, invite your team by email, and get structured results in minutes.
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              { title: "Invite by email", desc: "No employee accounts needed", icon: Mail },
              { title: "Structured scoring", desc: "5 criteria per scenario", icon: BarChart3 },
              { title: "Team insights", desc: "Common weaknesses at a glance", icon: Users },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-white">{item.title}</div>
                  <div className="text-sm text-slate-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 text-slate-500 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>No credit card required</span>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="lg:w-1/2 w-full py-8 px-6 flex flex-col justify-center">
        <div className="lg:max-w-[440px] w-full mx-auto">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/assets/images/logo_image.png"
                alt="ScorePrompt"
                width={120}
                height={28}
                priority
              />
            </Link>
            <div className="flex items-center justify-center gap-2 mb-4">
             <h1 className="text-2xl font-semibold text-heading dark:text-white text-center">
              Create your 
            </h1>
              <Image
                src="/assets/images/logo_text.png"
                alt="ScorePrompt"
                width={150}
                height={32}
                priority
                className="mt-1"
              />
                    <h1 className="text-2xl font-semibold text-heading dark:text-white">
                  account
            </h1>
            </div>

      
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
