import { createClient } from '@/lib/supabase/server';
import type { Campaign, CampaignParticipant, Employee } from '@/types';

export interface CampaignWithStats extends Campaign {
  participant_count: number;
  started_count: number;
  completed_count: number;
}

export interface ParticipantWithEmployee extends CampaignParticipant {
  employee: Employee;
}

export async function getCampaignsForOrganization(organizationId: string): Promise<CampaignWithStats[]> {
  const supabase = await createClient();

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error || !campaigns) return [];

  const campaignsWithStats: CampaignWithStats[] = await Promise.all(
    campaigns.map(async (campaign) => {
      const { data: participants } = await supabase
        .from('campaign_participants')
        .select('status')
        .eq('campaign_id', campaign.id);

      const participantCount = participants?.length || 0;
      const startedCount = participants?.filter(p => p.status === 'started' || p.status === 'completed').length || 0;
      const completedCount = participants?.filter(p => p.status === 'completed').length || 0;

      return {
        ...campaign,
        participant_count: participantCount,
        started_count: startedCount,
        completed_count: completedCount,
      } as CampaignWithStats;
    })
  );

  return campaignsWithStats;
}

export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error || !data) return null;

  return data as Campaign;
}

export async function getCampaignWithStats(campaignId: string): Promise<CampaignWithStats | null> {
  const supabase = await createClient();

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error || !campaign) return null;

  const { data: participants } = await supabase
    .from('campaign_participants')
    .select('status')
    .eq('campaign_id', campaignId);

  const participantCount = participants?.length || 0;
  const startedCount = participants?.filter(p => p.status === 'started' || p.status === 'completed').length || 0;
  const completedCount = participants?.filter(p => p.status === 'completed').length || 0;

  return {
    ...campaign,
    participant_count: participantCount,
    started_count: startedCount,
    completed_count: completedCount,
  } as CampaignWithStats;
}

export async function getCampaignParticipants(campaignId: string): Promise<ParticipantWithEmployee[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('campaign_participants')
    .select(`
      *,
      employee:employees(*)
    `)
    .eq('campaign_id', campaignId)
    .order('invited_at', { ascending: false });

  if (error || !data) return [];

  return data as ParticipantWithEmployee[];
}
