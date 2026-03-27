import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <main className="container mx-auto px-4 py-12">
          {children}
        </main>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </ThemeProvider>
  );
}
