import { createClient } from '@/lib/supabase/server';
import type { Campaign, CampaignParticipant, Employee, ParticipantWithEmployee, ScoreBand, ScenarioKey } from '@/types';
import { getScenario } from '@/lib/constants/assessment';
export type { ParticipantWithEmployee } from '@/types';

export interface CampaignWithStats extends Campaign {
  participant_count: number;
  opened_count: number;
  started_count: number;
  completed_count: number;
  average_score: number | null;
  weakest_area?: string | null;
  weakest_area_score?: number | null;
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

export interface CampaignCriteriaMetric {
  key: 'clarity' | 'context' | 'constraints' | 'output_format' | 'verification';
  label: 'Clarity' | 'Context' | 'Constraints' | 'Output Format' | 'Verification';
  average: number;
}

export interface CampaignCriteriaMetrics {
  criteria: CampaignCriteriaMetric[];
  weakestCounts: { key: CampaignCriteriaMetric['key']; label: CampaignCriteriaMetric['label']; count: number }[];
}

export interface ParticipantWithScore extends CampaignParticipant {
  employee: Employee;
  campaign_name?: string;
  score: {
    total_score: number;
    score_band: ScoreBand;
    clarity_score: number;
    context_score: number;
    constraints_score: number;
    output_format_score: number;
    verification_score: number;
  } | null;
  weakest_criterion: string | null;
  weakest_criterion_score: number | null;
}

// ─── Campaigns list ──────────────────────────────────────────────────────────

export async function getCampaignsForOrganization(
  organizationId: string,
  {
    page = 1,
    pageSize = 20,
    search = '',
    status = '',
    domain = '',
    date = '',
  }: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    domain?: string;
    date?: string;
  } = {}
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
  if (status) {
    query = query.eq('status', status);
  }
  if (domain) {
    query = query.eq('domain', domain);
  }
  if (date) {
    const now = new Date();
    const days = date === '30d' ? 30 : date === '90d' ? 90 : date === '365d' ? 365 : 0;
    if (days > 0) {
      const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', since);
    }
  }

  const { data: campaigns, error, count } = await query.range(from, to);

  if (error || !campaigns || campaigns.length === 0) {
    return { campaigns: [], total: count ?? 0 };
  }

  // Single batch query for participant counts — no N+1
  const campaignIds = campaigns.map((c) => c.id);
  const { data: participants } = await supabase
    .from('campaign_participants')
    .select('id, campaign_id, status')
    .in('campaign_id', campaignIds);

  const statsMap = new Map<string, { total: number; opened: number; started: number; completed: number }>();
  const participantToCampaign = new Map<string, string>();
  const completedParticipantIds: string[] = [];

  for (const p of participants ?? []) {
    participantToCampaign.set(p.id, p.campaign_id);
    const s = statsMap.get(p.campaign_id) ?? { total: 0, opened: 0, started: 0, completed: 0 };
    s.total++;
    if (p.status === 'opened' || p.status === 'started' || p.status === 'completed') s.opened++;
    if (p.status === 'started' || p.status === 'completed') s.started++;
    if (p.status === 'completed') {
      s.completed++;
      completedParticipantIds.push(p.id);
    }
    statsMap.set(p.campaign_id, s);
  }

  const scoredAttemptIdsByCampaign = new Map<string, string[]>();
  if (completedParticipantIds.length > 0) {
    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('id, campaign_participant_id')
      .in('campaign_participant_id', completedParticipantIds)
      .eq('status', 'scored');

    for (const attempt of attempts ?? []) {
      const campaignId = participantToCampaign.get(attempt.campaign_participant_id);
      if (!campaignId) continue;
      const existing = scoredAttemptIdsByCampaign.get(campaignId) ?? [];
      existing.push(attempt.id);
      scoredAttemptIdsByCampaign.set(campaignId, existing);
    }
  }

  const allAttemptIds = Array.from(scoredAttemptIdsByCampaign.values()).flat();
  const scoreAggMap = new Map<
    string,
    {
      totalScore: number;
      count: number;
      clarity: number;
      context: number;
      constraints: number;
      outputFormat: number;
      verification: number;
    }
  >();

  if (allAttemptIds.length > 0) {
    const { data: scores } = await supabase
      .from('assessment_scores')
      .select('attempt_id, total_score, clarity_score, context_score, constraints_score, output_format_score, verification_score')
      .in('attempt_id', allAttemptIds);

    const attemptToCampaign = new Map<string, string>();
    for (const [campaignId, attemptIds] of scoredAttemptIdsByCampaign.entries()) {
      for (const attemptId of attemptIds) {
        attemptToCampaign.set(attemptId, campaignId);
      }
    }

    for (const score of scores ?? []) {
      const campaignId = attemptToCampaign.get(score.attempt_id);
      if (!campaignId) continue;
      const current = scoreAggMap.get(campaignId) ?? {
        totalScore: 0,
        count: 0,
        clarity: 0,
        context: 0,
        constraints: 0,
        outputFormat: 0,
        verification: 0,
      };
      current.totalScore += score.total_score;
      current.count += 1;
      current.clarity += score.clarity_score;
      current.context += score.context_score;
      current.constraints += score.constraints_score;
      current.outputFormat += score.output_format_score;
      current.verification += score.verification_score;
      scoreAggMap.set(campaignId, current);
    }
  }

  const campaignsWithStats: CampaignWithStats[] = campaigns.map((campaign) => {
    const s = statsMap.get(campaign.id) ?? { total: 0, opened: 0, started: 0, completed: 0 };
    const scoreAgg = scoreAggMap.get(campaign.id);

    let weakestArea: string | null = null;
    let weakestAreaScore: number | null = null;
    let averageScore: number | null = null;

    if (scoreAgg && scoreAgg.count > 0) {
      averageScore = Math.round(scoreAgg.totalScore / scoreAgg.count);
      const criteria = [
        { label: 'Clarity', avg: scoreAgg.clarity / scoreAgg.count },
        { label: 'Context', avg: scoreAgg.context / scoreAgg.count },
        { label: 'Constraints', avg: scoreAgg.constraints / scoreAgg.count },
        { label: 'Output Format', avg: scoreAgg.outputFormat / scoreAgg.count },
        { label: 'Verification', avg: scoreAgg.verification / scoreAgg.count },
      ];
      criteria.sort((a, b) => a.avg - b.avg);
      weakestArea = criteria[0].label;
      weakestAreaScore = Math.round(criteria[0].avg * 5);
    }

    return {
      ...campaign,
      participant_count: s.total,
      opened_count: s.opened,
      started_count: s.started,
      completed_count: s.completed,
      average_score: averageScore,
      weakest_area: weakestArea,
      weakest_area_score: weakestAreaScore,
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
  const openedCount =
    participants?.filter((p) => p.status === 'opened' || p.status === 'started' || p.status === 'completed').length || 0;
  const startedCount =
    participants?.filter((p) => p.status === 'started' || p.status === 'completed').length || 0;
  const completedCount = participants?.filter((p) => p.status === 'completed').length || 0;

  let average_score: number | null = null;
  let weakest_area: string | null = null;
  let weakest_area_score: number | null = null;
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
        .select('total_score, score_band, clarity_score, context_score, constraints_score, output_format_score, verification_score')
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

        const totals = scores.reduce(
          (acc, s) => ({
            clarity: acc.clarity + s.clarity_score,
            context: acc.context + s.context_score,
            constraints: acc.constraints + s.constraints_score,
            outputFormat: acc.outputFormat + s.output_format_score,
            verification: acc.verification + s.verification_score,
          }),
          { clarity: 0, context: 0, constraints: 0, outputFormat: 0, verification: 0 }
        );
        const criteria = [
          { label: 'Clarity', avg: totals.clarity / scores.length },
          { label: 'Context', avg: totals.context / scores.length },
          { label: 'Constraints', avg: totals.constraints / scores.length },
          { label: 'Output Format', avg: totals.outputFormat / scores.length },
          { label: 'Verification', avg: totals.verification / scores.length },
        ].sort((a, b) => a.avg - b.avg);
        weakest_area = criteria[0].label;
        weakest_area_score = Math.round(criteria[0].avg * 5);
      }
    }
  }

  return {
    ...campaign,
    participant_count: participantCount,
    opened_count: openedCount,
    started_count: startedCount,
    completed_count: completedCount,
    average_score,
    weakest_area,
    weakest_area_score,
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
      { name: 'Verification', avg: data.verification / count },
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

export async function getCampaignCriteriaMetrics(
  campaignId: string
): Promise<CampaignCriteriaMetrics | null> {
  const supabase = await createClient();

  const { data: participants } = await supabase
    .from('campaign_participants')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('status', 'completed');

  if (!participants || participants.length === 0) return null;

  const { data: attempts } = await supabase
    .from('assessment_attempts')
    .select('id')
    .in('campaign_participant_id', participants.map((p) => p.id))
    .eq('status', 'scored');

  if (!attempts || attempts.length === 0) return null;

  const { data: scores } = await supabase
    .from('assessment_scores')
    .select('clarity_score, context_score, constraints_score, output_format_score, verification_score')
    .in('attempt_id', attempts.map((a) => a.id));

  if (!scores || scores.length === 0) return null;

  const totals = scores.reduce(
    (acc, score) => ({
      clarity: acc.clarity + score.clarity_score,
      context: acc.context + score.context_score,
      constraints: acc.constraints + score.constraints_score,
      output_format: acc.output_format + score.output_format_score,
      verification: acc.verification + score.verification_score,
    }),
    { clarity: 0, context: 0, constraints: 0, output_format: 0, verification: 0 }
  );

  const criteria: CampaignCriteriaMetric[] = [
    { key: 'clarity', label: 'Clarity', average: Math.round((totals.clarity / scores.length) * 5) },
    { key: 'context', label: 'Context', average: Math.round((totals.context / scores.length) * 5) },
    { key: 'constraints', label: 'Constraints', average: Math.round((totals.constraints / scores.length) * 5) },
    { key: 'output_format', label: 'Output Format', average: Math.round((totals.output_format / scores.length) * 5) },
    { key: 'verification', label: 'Verification', average: Math.round((totals.verification / scores.length) * 5) },
  ];

  const weakestCountMap = new Map<CampaignCriteriaMetric['key'], number>();
  for (const score of scores) {
    const scoredCriteria = [
      { key: 'clarity' as const, value: score.clarity_score },
      { key: 'context' as const, value: score.context_score },
      { key: 'constraints' as const, value: score.constraints_score },
      { key: 'output_format' as const, value: score.output_format_score },
      { key: 'verification' as const, value: score.verification_score },
    ].sort((a, b) => a.value - b.value);
    const weakest = scoredCriteria[0].key;
    weakestCountMap.set(weakest, (weakestCountMap.get(weakest) ?? 0) + 1);
  }

  const labelMap = new Map(criteria.map((c) => [c.key, c.label]));
  const weakestCounts = Array.from(weakestCountMap.entries())
    .map(([key, count]) => ({
      key,
      count,
      label: labelMap.get(key) ?? 'Clarity',
    }))
    .sort((a, b) => b.count - a.count);

  return { criteria, weakestCounts };
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
    weakest = '',
  }: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    band?: string;
    weakest?: string;
  } = {}
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

  let weakestParticipantIds: string[] | null = null;
  if (weakest) {
    const { data: allForCampaign } = await supabase
      .from('campaign_participants')
      .select('id')
      .eq('campaign_id', campaignId);

    const allIds = allForCampaign?.map((p) => p.id) ?? [];
    if (allIds.length === 0) return { participants: [], total: 0 };

    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select(`
        campaign_participant_id,
        assessment_scores(
          clarity_score,
          context_score,
          constraints_score,
          output_format_score,
          verification_score
        )
      `)
      .in('campaign_participant_id', allIds)
      .eq('status', 'scored');

    weakestParticipantIds = (attempts ?? [])
      .filter((a) => {
        const scores = a.assessment_scores as
          | {
              clarity_score: number;
              context_score: number;
              constraints_score: number;
              output_format_score: number;
              verification_score: number;
            }[]
          | null;
        const score = scores?.[0];
        if (!score) return false;
        const criteria = [
          { key: 'clarity', value: score.clarity_score },
          { key: 'context', value: score.context_score },
          { key: 'constraints', value: score.constraints_score },
          { key: 'output_format', value: score.output_format_score },
          { key: 'verification', value: score.verification_score },
        ].sort((x, y) => x.value - y.value);
        return criteria[0].key === weakest;
      })
      .map((a) => a.campaign_participant_id);

    if (weakestParticipantIds.length === 0) return { participants: [], total: 0 };
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
        assessment_scores(
          total_score,
          score_band,
          clarity_score,
          context_score,
          constraints_score,
          output_format_score,
          verification_score
        )
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
  if (weakestParticipantIds !== null) {
    query = query.in('id', weakestParticipantIds);
  }

  const { data, error, count } = await query.range(from, to);

  if (error || !data) return { participants: [], total: 0 };

  const participants: ParticipantWithScore[] = data.map((p) => {
    const employeeRaw = p.employee as Employee | Employee[] | null;
    const employee = (Array.isArray(employeeRaw) ? employeeRaw[0] : employeeRaw) as Employee;

    const attemptsRaw = p.assessment_attempts as
      | {
          id: string;
          status: string;
          assessment_scores: {
            total_score: number;
            score_band: string;
            clarity_score: number;
            context_score: number;
            constraints_score: number;
            output_format_score: number;
            verification_score: number;
          }[];
        }[]
      | null;
    const attempt = attemptsRaw?.[0] ?? null;
    const scoreRaw = attempt?.assessment_scores?.[0] ?? null;
    const score = scoreRaw
      ? {
          total_score: scoreRaw.total_score,
          score_band: scoreRaw.score_band as ScoreBand,
          clarity_score: scoreRaw.clarity_score,
          context_score: scoreRaw.context_score,
          constraints_score: scoreRaw.constraints_score,
          output_format_score: scoreRaw.output_format_score,
          verification_score: scoreRaw.verification_score,
        }
      : null;

    let weakestCriterion: string | null = null;
    let weakestCriterionScore: number | null = null;
    if (score) {
      const criteria = [
        { label: 'Clarity', value: score.clarity_score },
        { label: 'Context', value: score.context_score },
        { label: 'Constraints', value: score.constraints_score },
        { label: 'Output Format', value: score.output_format_score },
        { label: 'Verification', value: score.verification_score },
      ].sort((a, b) => a.value - b.value);
      weakestCriterion = criteria[0].label;
      weakestCriterionScore = criteria[0].value;
    }

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
      weakest_criterion: weakestCriterion,
      weakest_criterion_score: weakestCriterionScore,
    } as ParticipantWithScore;
  });

  return { participants, total: count ?? 0 };
}

export async function getOrganizationParticipantsPaginated(
  organizationId: string,
  {
    page = 1,
    pageSize = 50,
    search = '',
    campaign = '',
    status = '',
    band = '',
    weakest = '',
  }: {
    page?: number;
    pageSize?: number;
    search?: string;
    campaign?: string;
    status?: string;
    band?: string;
    weakest?: string;
  } = {}
): Promise<{ participants: ParticipantWithScore[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('organization_id', organizationId);

  if (!campaigns || campaigns.length === 0) {
    return { participants: [], total: 0 };
  }

  const campaignMap = new Map(campaigns.map((c) => [c.id, c.name]));
  const organizationCampaignIds = campaigns.map((c) => c.id);
  const eligibleCampaignIds =
    campaign && organizationCampaignIds.includes(campaign)
      ? [campaign]
      : campaign
      ? []
      : organizationCampaignIds;

  if (eligibleCampaignIds.length === 0) {
    return { participants: [], total: 0 };
  }

  let employeeIds: string[] | null = null;
  if (search) {
    const { data: matchingEmployees } = await supabase
      .from('employees')
      .select('id')
      .or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    employeeIds = matchingEmployees?.map((e) => e.id) ?? [];
    if (employeeIds.length === 0) {
      return { participants: [], total: 0 };
    }
  }

  let baseParticipantsQuery = supabase
    .from('campaign_participants')
    .select('id')
    .in('campaign_id', eligibleCampaignIds);

  if (employeeIds !== null) {
    baseParticipantsQuery = baseParticipantsQuery.in('employee_id', employeeIds);
  }
  if (status) {
    baseParticipantsQuery = baseParticipantsQuery.eq('status', status);
  }

  const { data: baseParticipants } = await baseParticipantsQuery;
  const scopedParticipantIds = (baseParticipants ?? []).map((p) => p.id);
  if (scopedParticipantIds.length === 0) {
    return { participants: [], total: 0 };
  }

  let bandParticipantIds: string[] | null = null;
  if (band) {
    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('campaign_participant_id, assessment_scores(score_band)')
      .in('campaign_participant_id', scopedParticipantIds);

    bandParticipantIds = (attempts ?? [])
      .filter((a) => {
        const scores = a.assessment_scores as { score_band: string }[] | null;
        return scores?.[0]?.score_band === band;
      })
      .map((a) => a.campaign_participant_id);

    if (bandParticipantIds.length === 0) {
      return { participants: [], total: 0 };
    }
  }

  let weakestParticipantIds: string[] | null = null;
  if (weakest) {
    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select(`
        campaign_participant_id,
        assessment_scores(
          clarity_score,
          context_score,
          constraints_score,
          output_format_score,
          verification_score
        )
      `)
      .in('campaign_participant_id', scopedParticipantIds)
      .eq('status', 'scored');

    weakestParticipantIds = (attempts ?? [])
      .filter((a) => {
        const scores = a.assessment_scores as
          | {
              clarity_score: number;
              context_score: number;
              constraints_score: number;
              output_format_score: number;
              verification_score: number;
            }[]
          | null;
        const score = scores?.[0];
        if (!score) return false;
        const criteria = [
          { key: 'clarity', value: score.clarity_score },
          { key: 'context', value: score.context_score },
          { key: 'constraints', value: score.constraints_score },
          { key: 'output_format', value: score.output_format_score },
          { key: 'verification', value: score.verification_score },
        ].sort((x, y) => x.value - y.value);
        return criteria[0].key === weakest;
      })
      .map((a) => a.campaign_participant_id);

    if (weakestParticipantIds.length === 0) {
      return { participants: [], total: 0 };
    }
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
        assessment_scores(
          total_score,
          score_band,
          clarity_score,
          context_score,
          constraints_score,
          output_format_score,
          verification_score
        )
      )
    `,
      { count: 'exact' }
    )
    .in('campaign_id', eligibleCampaignIds)
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
  if (weakestParticipantIds !== null) {
    query = query.in('id', weakestParticipantIds);
  }

  const { data, error, count } = await query.range(from, to);
  if (error || !data) {
    return { participants: [], total: 0 };
  }

  const participants: ParticipantWithScore[] = data.map((p) => {
    const employeeRaw = p.employee as Employee | Employee[] | null;
    const employee = (Array.isArray(employeeRaw) ? employeeRaw[0] : employeeRaw) as Employee;

    const attemptsRaw = p.assessment_attempts as
      | {
          id: string;
          status: string;
          assessment_scores: {
            total_score: number;
            score_band: string;
            clarity_score: number;
            context_score: number;
            constraints_score: number;
            output_format_score: number;
            verification_score: number;
          }[];
        }[]
      | null;
    const attempt = attemptsRaw?.[0] ?? null;
    const scoreRaw = attempt?.assessment_scores?.[0] ?? null;
    const score = scoreRaw
      ? {
          total_score: scoreRaw.total_score,
          score_band: scoreRaw.score_band as ScoreBand,
          clarity_score: scoreRaw.clarity_score,
          context_score: scoreRaw.context_score,
          constraints_score: scoreRaw.constraints_score,
          output_format_score: scoreRaw.output_format_score,
          verification_score: scoreRaw.verification_score,
        }
      : null;

    let weakestCriterion: string | null = null;
    let weakestCriterionScore: number | null = null;
    if (score) {
      const criteria = [
        { label: 'Clarity', value: score.clarity_score },
        { label: 'Context', value: score.context_score },
        { label: 'Constraints', value: score.constraints_score },
        { label: 'Output Format', value: score.output_format_score },
        { label: 'Verification', value: score.verification_score },
      ].sort((a, b) => a.value - b.value);
      weakestCriterion = criteria[0].label;
      weakestCriterionScore = criteria[0].value;
    }

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
      campaign_name: campaignMap.get(p.campaign_id) ?? 'Unknown',
      score,
      weakest_criterion: weakestCriterion,
      weakest_criterion_score: weakestCriterionScore,
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
