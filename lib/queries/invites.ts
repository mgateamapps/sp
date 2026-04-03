import { createAdminClient } from '@/lib/supabase/admin';
import { createHash } from 'crypto';
import type { Campaign, CampaignParticipant, Employee } from '@/types';

export interface ParticipantWithDetails extends CampaignParticipant {
  employee: Employee;
  campaign: Campaign;
}

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function getParticipantByTokenHash(
  tokenHash: string
): Promise<ParticipantWithDetails | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('campaign_participants')
    .select(`
      *,
      employee:employees(*),
      campaign:campaigns(*)
    `)
    .eq('token_hash', tokenHash)
    .single();

  if (error || !data) {
    return null;
  }

  return data as ParticipantWithDetails;
}

export async function validateInviteToken(
  rawToken: string
): Promise<ParticipantWithDetails | null> {
  const tokenHash = hashToken(rawToken);
  return getParticipantByTokenHash(tokenHash);
}

export async function markParticipantOpened(
  participantId: string
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('campaign_participants')
    .update({
      status: 'opened',
      opened_at: new Date().toISOString(),
    })
    .eq('id', participantId)
    .eq('status', 'invited');

  return !error;
}
