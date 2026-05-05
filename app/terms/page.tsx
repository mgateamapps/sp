import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms & Conditions | ScorePrompt",
  description:
    "Terms and conditions for using ScorePrompt, including account, acceptable use, and payment terms.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col">
      {/* Top bar / hero strip */}
      <header className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/images/logo_wide.png"
              alt="ScorePrompt"
              width={160}
              height={36}
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm text-slate-200/80 hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-slate-200/80 hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center text-sm font-semibold text-slate-900 bg-white px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-100"
            >
              Try free
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">
          <div className="mb-8">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              Legal
            </span>
          </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950/60 shadow-sm p-6 md:p-8 space-y-6 text-neutral-800 dark:text-neutral-200">
          <section>
            <h2 className="text-xl font-semibold">1. Agreement to the Terms</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              By creating an account and using ScorePrompt, you agree to these Terms &amp; Conditions.
              If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Description of the Service</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              ScorePrompt is a B2B platform for assessing employee AI literacy through guided prompt-writing
              scenarios, generating structured scoring, and producing feedback and analytics for organizations.
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              In the MVP, employees typically do not create their own accounts. Instead, your organization
              invites employees via secure email links, and the system validates those links server-side.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Eligibility &amp; Authority</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              You represent that you are authorized to bind your organization to these Terms and to provide
              employees’ contact details for invite purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Account, Security, and Passwords</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              Your administrator account is created through Supabase Auth. Passwords are managed by Supabase.
              You are responsible for maintaining the confidentiality of your login credentials and for all activities
              that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Acceptable Use</h2>
            <ul className="mt-2 space-y-2 text-sm leading-6 list-disc pl-5">
              <li>
                You agree not to misuse the service, interfere with the security or availability of the platform,
                or attempt to reverse engineer the system.
              </li>
              <li>
                You are responsible for the accuracy and legality of any prompts, employee responses, and other
                content you provide through the platform.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Scoring &amp; Results</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              ScorePrompt may use an AI model (for example, GPT-based scoring) to produce structured scores and feedback.
              Results are informational and reflect the scoring criteria configured by the platform. No specific outcome is guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Payments and Usage</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              Where applicable, payments are processed via Stripe (including checkout and subscription flows).
              If you purchase assessment packs, your usage and balance are tracked by the system.
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              Refunds, if available, may follow the MVP policy that supports partial refunds for employees who have not started.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Changes to the Terms</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              We may update these Terms from time to time. Your continued use of the service after changes become effective means you accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Contact</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              Questions about these Terms can be sent to{" "}
              <a className="text-primary font-semibold hover:underline" href="mailto:legal@scoreprompt.example">
                legal@scoreprompt.example
              </a>
              .
            </p>
          </section>

          <p className="text-xs text-neutral-500 border-t border-neutral-200 dark:border-neutral-800 pt-4">
            Note: This MVP Terms page is provided as a starting template and may require legal review before production launch.
          </p>
        </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
          © {new Date().getFullYear()} ScorePrompt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

