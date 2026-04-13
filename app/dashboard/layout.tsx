import { ClientRoot } from "@/app/client-root";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let avatarUrl: string | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('logo_url')
          .eq('id', profile.organization_id)
          .single();
        avatarUrl = org?.logo_url ?? null;
      }
    }

    return (
      <ClientRoot defaultOpen={defaultOpen} avatarUrl={avatarUrl}>
        {children}
      </ClientRoot>
    );
  } catch (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground">We couldn&apos;t load the layout. Please try again later.</p>
      </div>
    );
  }
}
