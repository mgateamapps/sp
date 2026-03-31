import ForgotPasswordComponent from "@/components/auth/forgot-password";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forgot Password | ScorePrompt",
  description: "Reset your ScorePrompt account password.",
};

export default function ForgotPasswordPage() {
  return (
    <section className="bg-white dark:bg-neutral-950 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md px-6 py-12">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-primary inline-block mb-6">
            ScorePrompt
          </Link>

          <h1 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">
            Forgot password?
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <ForgotPasswordComponent />
      </div>
    </section>
  );
}
