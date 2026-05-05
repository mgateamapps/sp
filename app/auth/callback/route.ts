import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && authData.user) {
      // If explicit next path provided, use it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Check if user has an admin profile (existing user)
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('id, organization_id')
        .eq('user_id', authData.user.id)
        .single();

      if (adminProfile?.organization_id) {
        // Check if organization has any subscription or campaigns
        const [subscriptionResult, campaignsResult] = await Promise.all([
          supabase
            .from('subscriptions')
            .select('id')
            .eq('organization_id', adminProfile.organization_id)
            .limit(1),
          supabase
            .from('campaigns')
            .select('id')
            .eq('organization_id', adminProfile.organization_id)
            .limit(1),
        ]);

        const hasSubscription = (subscriptionResult.data?.length ?? 0) > 0;
        const hasCampaigns = (campaignsResult.data?.length ?? 0) > 0;

        // New user with no activity - show choose plan page
        if (!hasSubscription && !hasCampaigns) {
          return NextResponse.redirect(`${origin}/onboarding/choose-plan`);
        }
      }

      // Existing user or user without organization - go to campaigns home
      return NextResponse.redirect(`${origin}/app/campaigns`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`);
}
