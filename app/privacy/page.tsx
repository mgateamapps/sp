import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy | ScorePrompt",
  description:
    "Privacy Policy for ScorePrompt, describing what information we collect, how we use it, and how employees and organizations are supported through the platform.",
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">Privacy Policy</h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950/60 shadow-sm p-6 md:p-8 space-y-6 text-neutral-800 dark:text-neutral-200">
          <section>
            <h2 className="text-xl font-semibold">1. Who we are</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              ScorePrompt is a B2B platform that helps organizations assess and improve employee AI literacy through structured prompt-writing exercises.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Information we collect</h2>
            <div className="mt-2 space-y-4 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-200">2.1 Administrator account data</h3>
                <p>
                  When you create an organization account, we collect your full name, organization name, and email address.
                  Passwords are handled by Supabase Auth.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-200">2.2 Employee assessment data</h3>
                <p>
                  When employees participate, we collect assessment responses submitted through the guided flow (for example, the text of prompts/responses and associated attempt metadata).
                </p>
                <p className="mt-1">
                  We also store scoring outputs such as per-scenario scores, strengths/weaknesses, and feedback generated from the submitted responses.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-200">2.3 Invite tokens</h3>
                <p>
                  Employees receive secure email links containing a raw invite token. The platform stores a hash of the token (token_hash) rather than the raw token.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-200">2.4 Billing data</h3>
                <p>
                  If you subscribe or make payments, Stripe processes checkout and subscription billing. We track payment and subscription state in our system (for example, Stripe identifiers and usage status).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. How we use information</h2>
            <ul className="mt-2 space-y-2 text-sm leading-6 list-disc pl-5 text-neutral-700 dark:text-neutral-300">
              <li>Create and manage organization accounts and administrator profiles.</li>
              <li>Send assessment invites and validate secure invite links.</li>
              <li>Score employee responses and generate structured feedback.</li>
              <li>Provide organization dashboards with aggregated results and status tracking.</li>
              <li>Process payments and manage subscription credits/usage.</li>
              <li>Maintain security, reliability, and prevent unauthorized access.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. How we share information</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              We may share information with service providers that help us operate the platform, including:
              Supabase (authentication and data storage), Resend (email delivery), Stripe (payments), and AI/LLM providers used for scoring.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Security</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              The platform uses security measures such as Supabase Row Level Security (RLS) and stores hashed invite tokens
              to reduce the risk of token exposure. We also limit employee access using server-side validation of invite tokens.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Data retention</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              We retain information for as long as necessary to provide the service, billing, and support your organization’s assessments.
              Retention periods may vary depending on the data type and applicable requirements. You can contact us to request access, correction, or deletion where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Your rights</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              Depending on your jurisdiction, you may have rights to access, update, or delete personal data.
              To make a request, contact us using the information below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Contact</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              Questions about this Privacy Policy can be sent to{" "}
              <a className="text-primary font-semibold hover:underline" href="mailto:privacy@scoreprompt.example">
                privacy@scoreprompt.example
              </a>
              .
            </p>
          </section>

          <p className="text-xs text-neutral-500 border-t border-neutral-200 dark:border-neutral-800 pt-4">
            Note: This MVP Privacy Policy page is based on the platform’s current technical behavior and may require legal review before production launch.
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

