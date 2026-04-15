import { createClient } from '@/lib/supabase/server';
import type { Campaign, CampaignParticipant, Employee, ParticipantWithEmployee, ScoreBand, ScenarioKey } from '@/types';
import { getScenario } from '@/lib/constants/assessment';
export type { ParticipantWithEmployee } from '@/types';

export interface CampaignWithStats extends Campaign {
  participant_count: number;
  started_count: number;
  completed_count: number;
  average_score: number | null;
  score_distribution: { band: ScoreBand; count: number }[];
}

export interface ScenarioBreakdown {
  scenarioKey: string;
  scenarioTitle: string;
  averageScore: number;
  completedCount: number;
  hardestCriterion: string;
  hardestCriterionAvg: number;
}

export interface ParticipantWithScore extends CampaignParticipant {
  employee: Employee;
  score: { total_score: number; score_band: ScoreBand } | null;
}

// ─── Campaigns list ──────────────────────────────────────────────────────────

export async function getCampaignsForOrganization(
  organizationId: string,
  {
    page = 1,
    pageSize = 20,
    search = '',
  }: { page?: number; pageSize?: number; search?: string } = {}
): Promise<{ campaigns: CampaignWithStats[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('campaigns')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data: campaigns, error, count } = await query.range(from, to);

  if (error || !campaigns || campaigns.length === 0) {
    return { campaigns: [], total: count ?? 0 };
  }

  // Single batch query for participant counts — no N+1
  const campaignIds = campaigns.map((c) => c.id);
  const { data: participants } = await supabase
    .from('campaign_participants')
    .select('campaign_id, status')
    .in('campaign_id', campaignIds);

  const statsMap = new Map<string, { total: number; started: number; completed: number }>();
  for (const p of participants ?? []) {
    const s = statsMap.get(p.campaign_id) ?? { total: 0, started: 0, completed: 0 };
    s.total++;
    if (p.status === 'started' || p.status === 'completed') s.started++;
    if (p.status === 'completed') s.completed++;
    statsMap.set(p.campaign_id, s);
  }

  const campaignsWithStats: CampaignWithStats[] = campaigns.map((campaign) => {
    const s = statsMap.get(campaign.id) ?? { total: 0, started: 0, completed: 0 };
    return {
      ...campaign,
      participant_count: s.total,
      started_count: s.started,
      completed_count: s.completed,
    } as CampaignWithStats;
  });

  return { campaigns: campaignsWithStats, total: count ?? 0 };
}

// ─── Campaign detail ──────────────────────────────────────────────────────────

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
    .select('id, status')
    .eq('campaign_id', campaignId);

  const participantCount = participants?.length || 0;
  const startedCount =
    participants?.filter((p) => p.status === 'started' || p.status === 'completed').length || 0;
  const completedCount = participants?.filter((p) => p.status === 'completed').length || 0;

  let average_score: number | null = null;
  let score_distribution: { band: ScoreBand; count: number }[] = [];

  const completedIds = participants?.filter((p) => p.status === 'completed').map((p) => p.id) ?? [];
  if (completedIds.length > 0) {
    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('id')
      .in('campaign_participant_id', completedIds)
      .eq('status', 'scored');

    if (attempts && attempts.length > 0) {
      const { data: scores } = await supabase
        .from('assessment_scores')
        .select('total_score, score_band')
        .in('attempt_id', attempts.map((a) => a.id));

      if (scores && scores.length > 0) {
        average_score = Math.round(scores.reduce((sum, s) => sum + s.total_score, 0) / scores.length);

        const distMap = new Map<ScoreBand, number>();
        for (const s of scores) {
          const band = s.score_band as ScoreBand;
          distMap.set(band, (distMap.get(band) ?? 0) + 1);
        }
        const bandOrder: ScoreBand[] = ['expert', 'strong', 'functional', 'basic', 'at_risk'];
        score_distribution = bandOrder.map((band) => ({ band, count: distMap.get(band) ?? 0 }));
      }
    }
  }

  return {
    ...campaign,
    participant_count: participantCount,
    started_count: startedCount,
    completed_count: completedCount,
    average_score,
    score_distribution,
  } as CampaignWithStats;
}

export async function getCampaignScenarioBreakdown(
  campaignId: string
): Promise<ScenarioBreakdown[]> {
  const supabase = await createClient();

  const { data: participants } = await supabase
    .from('campaign_participants')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('status', 'completed');

  if (!participants || participants.length === 0) return [];

  const { data: attempts } = await supabase
    .from('assessment_attempts')
    .select('id')
    .in('campaign_participant_id', participants.map((p) => p.id))
    .eq('status', 'scored');

  if (!attempts || attempts.length === 0) return [];

  const { data: scenarioScores } = await supabase
    .from('scenario_scores')
    .select(
      'scenario_key, scenario_score, clarity_score, context_score, constraints_score, output_format_score, verification_score'
    )
    .in('attempt_id', attempts.map((a) => a.id));

  if (!scenarioScores || scenarioScores.length === 0) return [];

  type ScenarioAgg = {
    totalScore: number;
    clarity: number;
    context: number;
    constraints: number;
    outputFormat: number;
    verification: number;
    count: number;
  };
  const grouped = new Map<string, ScenarioAgg>();

  for (const s of scenarioScores) {
    const existing = grouped.get(s.scenario_key) ?? {
      totalScore: 0, clarity: 0, context: 0, constraints: 0, outputFormat: 0, verification: 0, count: 0,
    };
    existing.totalScore += s.scenario_score;
    existing.clarity += s.clarity_score;
    existing.context += s.context_score;
    existing.constraints += s.constraints_score;
    existing.outputFormat += s.output_format_score;
    existing.verification += s.verification_score;
    existing.count++;
    grouped.set(s.scenario_key, existing);
  }

  const results: ScenarioBreakdown[] = [];
  for (const [key, data] of grouped) {
    const { count } = data;
    const criteria = [
      { name: 'Clarity', avg: data.clarity / count },
      { name: 'Context', avg: data.context / count },
      { name: 'Constraints', avg: data.constraints / count },
      { name: 'Output Format', avg: data.outputFormat / count },
      { name: 'Specificity', avg: data.verification / count },
    ];
    const hardest = criteria.reduce((min, c) => (c.avg < min.avg ? c : min), criteria[0]);
    const scenario = getScenario(key as ScenarioKey);

    results.push({
      scenarioKey: key,
      scenarioTitle: scenario?.title ?? key,
      averageScore: Math.round(data.totalScore / count),
      completedCount: count,
      hardestCriterion: hardest.name,
      hardestCriterionAvg: Math.round(hardest.avg),
    });
  }

  return results.sort((a, b) => a.averageScore - b.averageScore);
}

// ─── Participants (paginated, with scores joined) ─────────────────────────────

export async function getCampaignParticipantsPaginated(
  campaignId: string,
  {
    page = 1,
    pageSize = 50,
    search = '',
    status = '',
    band = '',
  }: { page?: number; pageSize?: number; search?: string; status?: string; band?: string } = {}
): Promise<{ participants: ParticipantWithScore[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Filter by employee email search
  let employeeIds: string[] | null = null;
  if (search) {
    const { data: matchingEmployees } = await supabase
      .from('employees')
      .select('id')
      .ilike('email', `%${search}%`);

    employeeIds = matchingEmployees?.map((e) => e.id) ?? [];
    if (employeeIds.length === 0) {
      return { participants: [], total: 0 };
    }
  }

  // Filter by score band: pre-query to get matching participant IDs
  let bandParticipantIds: string[] | null = null;
  if (band) {
    const { data: allForCampaign } = await supabase
      .from('campaign_participants')
      .select('id')
      .eq('campaign_id', campaignId);

    const allIds = allForCampaign?.map((p) => p.id) ?? [];
    if (allIds.length === 0) return { participants: [], total: 0 };

    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('campaign_participant_id, assessment_scores(score_band)')
      .in('campaign_participant_id', allIds);

    bandParticipantIds = (attempts ?? [])
      .filter((a) => {
        const scores = a.assessment_scores as { score_band: string }[] | null;
        return scores?.[0]?.score_band === band;
      })
      .map((a) => a.campaign_participant_id);

    if (bandParticipantIds.length === 0) return { participants: [], total: 0 };
  }

  let query = supabase
    .from('campaign_participants')
    .select(
      `
      id, campaign_id, employee_id, status, token_hash,
      invited_at, started_at, completed_at,
      employee:employees(id, email, full_name),
      assessment_attempts(
        id, status,
        assessment_scores(total_score, score_band)
      )
    `,
      { count: 'exact' }
    )
    .eq('campaign_id', campaignId)
    .order('invited_at', { ascending: false });

  if (employeeIds !== null) {
    query = query.in('employee_id', employeeIds);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (bandParticipantIds !== null) {
    query = query.in('id', bandParticipantIds);
  }

  const { data, error, count } = await query.range(from, to);

  if (error || !data) return { participants: [], total: 0 };

  const participants: ParticipantWithScore[] = data.map((p) => {
    const employeeRaw = p.employee as Employee | Employee[] | null;
    const employee = (Array.isArray(employeeRaw) ? employeeRaw[0] : employeeRaw) as Employee;

    const attemptsRaw = p.assessment_attempts as
      | { id: string; status: string; assessment_scores: { total_score: number; score_band: string }[] }[]
      | null;
    const attempt = attemptsRaw?.[0] ?? null;
    const scoreRaw = attempt?.assessment_scores?.[0] ?? null;
    const score = scoreRaw
      ? { total_score: scoreRaw.total_score, score_band: scoreRaw.score_band as ScoreBand }
      : null;

    return {
      id: p.id,
      campaign_id: p.campaign_id,
      employee_id: p.employee_id,
      status: p.status,
      token_hash: p.token_hash,
      token: null,
      invited_at: p.invited_at,
      started_at: p.started_at,
      completed_at: p.completed_at,
      employee,
      score,
    } as ParticipantWithScore;
  });

  return { participants, total: count ?? 0 };
}

// Keep legacy function for any remaining consumers
export async function getCampaignParticipants(
  campaignId: string
): Promise<ParticipantWithEmployee[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('campaign_participants')
    .select(`*, employee:employees(*)`)
    .eq('campaign_id', campaignId)
    .order('invited_at', { ascending: false });

  if (error || !data) return [];

  return data as ParticipantWithEmployee[];
}

// ─── Single participant ───────────────────────────────────────────────────────

export interface ParticipantWithCampaignAndEmployee extends CampaignParticipant {
  employee: Employee;
  campaign: Campaign;
}

export async function getParticipantById(
  participantId: string
): Promise<ParticipantWithCampaignAndEmployee | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('campaign_participants')
    .select(`*, employee:employees(*), campaign:campaigns(*)`)
    .eq('id', participantId)
    .single();

  if (error || !data) return null;

  return data as ParticipantWithCampaignAndEmployee;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface CampaignPayment {
  id: string;
  status: string;
  amount_cents: number;
  employee_count: number;
  refund_amount_cents: number;
  refund_employee_count: number;
  completed_at: string | null;
}

export async function getCampaignPayment(campaignId: string): Promise<CampaignPayment | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('payments')
    .select(
      'id, status, amount_cents, employee_count, refund_amount_cents, refund_employee_count, completed_at'
    )
    .eq('campaign_id', campaignId)
    .in('status', ['completed', 'partially_refunded'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return data as CampaignPayment;
}
