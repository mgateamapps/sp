'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { generateToken, hashToken } from '@/lib/queries/invites';
import { sendInviteEmail } from '@/lib/email/resend';
import { redirect } from 'next/navigation';

export async function startQuickTest(): Promise<{ error: string } | never> {
  const supabase = await createClient();

  const admin = await getCurrentAdminProfile();
  if (!admin) return { error: 'Not authenticated' };

  const { data: org } = await supabase
    .from('organizations')
    .select('name, invite_message, invite_reply_to')
    .eq('id', admin.organization_id)
    .single();

  const campaignName = `Personal Test — ${new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;

  // Create campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .insert({
      organization_id: admin.organization_id,
      name: campaignName,
      description: 'Quick personal test — try the assessment yourself.',
      domain: 'other',
      status: 'draft',
    })
    .select()
    .single();

  if (campaignError || !campaign) {
    return { error: 'Failed to create test campaign' };
  }

  // Upsert admin as employee
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .upsert(
      [{ organization_id: admin.organization_id, email: admin.email }],
      { onConflict: 'organization_id,email' }
    )
    .select('id, email');

  if (empError || !employees || employees.length === 0) {
    return { error: 'Failed to add participant' };
  }

  // Create participant
  const { data: participant, error: partError } = await supabase
    .from('campaign_participants')
    .insert({
      campaign_id: campaign.id,
      employee_id: employees[0].id,
      status: 'invited',
    })
    .select()
    .single();

  if (partError || !participant) {
    return { error: 'Failed to create participant' };
  }

  // Generate invite token and send email
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  await supabase
    .from('campaign_participants')
    .update({
      token_hash: tokenHash,
      invited_at: new Date().toISOString(),
    })
    .eq('id', participant.id);

  // Activate campaign
  await supabase
    .from('campaigns')
    .update({ status: 'active' })
    .eq('id', campaign.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteUrl = `${appUrl}/invite/${rawToken}`;

  await sendInviteEmail({
    to: admin.email,
    campaignName,
    inviteUrl,
    deadline: null,
    customMessage: org?.invite_message ?? null,
    replyTo: org?.invite_reply_to ?? null,
    organizationName: org?.name ?? null,
  });

  redirect(`/app/campaigns/${campaign.id}?quick_test=1`);
}
