'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { generateToken, hashToken } from '@/lib/queries/invites';
import { sendInviteEmail } from '@/lib/email/resend';
import { revalidatePath } from 'next/cache';

export interface SendInvitesResult {
  success: boolean;
  sent: number;
  failed: number;
  error?: string;
}

export interface ResendInviteResult {
  success: boolean;
  error?: string;
}

export async function sendCampaignInvites(campaignId: string): Promise<SendInvitesResult> {
  const supabase = await createClient();

  const admin = await getCurrentAdminProfile();
  if (!admin) {
    return { success: false, sent: 0, failed: 0, error: 'Not authenticated' };
  }

  const [campaignResult, orgResult] = await Promise.all([
    supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('organization_id', admin.organization_id)
      .single(),
    supabase
      .from('organizations')
      .select('name, invite_message, invite_reply_to')
      .eq('id', admin.organization_id)
      .single(),
  ]);

  const { data: campaign, error: campaignError } = campaignResult;
  const organization = orgResult.data;

  if (campaignError || !campaign) {
    return { success: false, sent: 0, failed: 0, error: 'Campaign not found' };
  }

  const { data: participants, error: participantsError } = await supabase
    .from('campaign_participants')
    .select(`
      id,
      status,
      token_hash,
      employee:employees(id, email)
    `)
    .eq('campaign_id', campaignId)
    .in('status', ['invited']);

  if (participantsError || !participants) {
    return { success: false, sent: 0, failed: 0, error: 'Failed to fetch participants' };
  }

  const participantsToInvite = participants.filter(p => !p.token_hash);

  if (participantsToInvite.length === 0) {
    return { success: true, sent: 0, failed: 0, error: 'No new participants to invite' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  let sent = 0;
  let failed = 0;

  for (const participant of participantsToInvite) {
    const employeeData = participant.employee as { id: string; email: string } | { id: string; email: string }[] | null;
    const employee = Array.isArray(employeeData) ? employeeData[0] : employeeData;
    
    if (!employee?.email) {
      failed++;
      continue;
    }

    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);

    const { error: updateError } = await supabase
      .from('campaign_participants')
      .update({
        token_hash: tokenHash,
        invited_at: new Date().toISOString(),
      })
      .eq('id', participant.id);

    if (updateError) {
      console.error(`Failed to update token for participant ${participant.id}:`, updateError);
      failed++;
      continue;
    }

    const inviteUrl = `${appUrl}/invite/${rawToken}`;
    
    const emailResult = await sendInviteEmail({
      to: employee.email,
      campaignName: campaign.name,
      inviteUrl,
      deadline: campaign.deadline,
      customMessage: organization?.invite_message ?? null,
      replyTo: organization?.invite_reply_to ?? null,
      organizationName: organization?.name ?? null,
    });

    if (emailResult.success) {
      sent++;
    } else {
      console.error(`Failed to send email to ${employee.email}:`, emailResult.error);
      failed++;
    }
  }

  if (campaign.status === 'draft' && sent > 0) {
    await supabase
      .from('campaigns')
      .update({ status: 'active' })
      .eq('id', campaignId);
  }

  revalidatePath(`/app/campaigns/${campaignId}`);
  revalidatePath('/app/campaigns');

  return {
    success: true,
    sent,
    failed,
  };
}

export async function resendInviteToParticipant(
  campaignId: string,
  participantId: string
): Promise<ResendInviteResult> {
  const supabase = await createClient();
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    return { success: false, error: 'Not authenticated' };
  }

  const [campaignResult, participantResult, orgResult] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, name, deadline, organization_id')
      .eq('id', campaignId)
      .eq('organization_id', admin.organization_id)
      .single(),
    supabase
      .from('campaign_participants')
      .select(`
        id, campaign_id, status,
        employee:employees(email)
      `)
      .eq('id', participantId)
      .eq('campaign_id', campaignId)
      .single(),
    supabase
      .from('organizations')
      .select('name, invite_message, invite_reply_to')
      .eq('id', admin.organization_id)
      .single(),
  ]);

  const campaign = campaignResult.data;
  const participant = participantResult.data;
  const organization = orgResult.data;

  if (!campaign || !participant) {
    return { success: false, error: 'Participant or campaign not found' };
  }

  if (participant.status === 'completed') {
    return { success: false, error: 'Assessment already completed' };
  }

  const employeeData = participant.employee as { email: string } | { email: string }[] | null;
  const employee = Array.isArray(employeeData) ? employeeData[0] : employeeData;
  if (!employee?.email) {
    return { success: false, error: 'Participant email missing' };
  }

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  const { error: updateError } = await supabase
    .from('campaign_participants')
    .update({
      token_hash: tokenHash,
      invited_at: new Date().toISOString(),
    })
    .eq('id', participantId);

  if (updateError) {
    return { success: false, error: 'Failed to update invite token' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteUrl = `${appUrl}/invite/${rawToken}`;
  const emailResult = await sendInviteEmail({
    to: employee.email,
    campaignName: campaign.name,
    inviteUrl,
    deadline: campaign.deadline,
    customMessage: organization?.invite_message ?? null,
    replyTo: organization?.invite_reply_to ?? null,
    organizationName: organization?.name ?? null,
  });

  if (!emailResult.success) {
    return { success: false, error: emailResult.error ?? 'Failed to send invite email' };
  }

  revalidatePath(`/app/campaigns/${campaignId}`);
  revalidatePath(`/app/campaigns/${campaignId}?tab=participants`);
  return { success: true };
}
