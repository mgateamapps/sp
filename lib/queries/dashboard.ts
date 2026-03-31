import { createClient } from '@/lib/supabase/server';
import type { ScoreBand } from '@/types';

export interface DashboardStats {
  totalCampaigns: number;
  totalEmployees: number;
  pendingAssessments: number;
  completedThisMonth: number;
  averageScore: number | null;
  completionRate: number;
}

export interface SkillBreakdown {
  clarity: number;
  context: number;
  constraints: number;
  outputFormat: number;
  verification: number;
}

export interface ScoreDistribution {
  atRisk: number;
  basic: number;
  functional: number;
  strong: number;
  expert: number;
}

export interface RecentCompletion {
  id: string;
  employeeEmail: string;
  campaignName: string;
  score: number;
  scoreBand: ScoreBand;
  completedAt: string;
}

export interface CommonWeakness {
  criterion: string;
  label: string;
  averageScore: number;
}

export interface TopPerformer {
  id: string;
  employeeEmail: string;
  campaignName: string;
  score: number;
  scoreBand: ScoreBand;
  rank: number;
}

export interface CampaignComparison {
  id: string;
  name: string;
  averageScore: number | null;
  completedCount: number;
  totalCount: number;
  completionRate: number;
  createdAt: string;
  trend: 'up' | 'down' | 'same' | null;
}

export interface EmployeeProgress {
  employeeEmail: string;
  assessments: {
    campaignName: string;
    score: number;
    completedAt: string;
  }[];
  improvement: number;
}

export interface ScoreTrendPoint {
  campaignName: string;
  averageScore: number;
  date: string;
}

export async function getDashboardStats(
  organizationId: string
): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('organization_id', organizationId);

  const totalCampaigns = campaigns?.length || 0;

  if (totalCampaigns === 0) {
    return {
      totalCampaigns: 0,
      totalEmployees: 0,
      pendingAssessments: 0,
      completedThisMonth: 0,
      averageScore: null,
      completionRate: 0,
    };
  }

  const campaignIds = campaigns?.map((c) => c.id) || [];

  const { data: participants } = await supabase
    .from('campaign_participants')
    .select('id, status, completed_at')
    .in('campaign_id', campaignIds);

  const totalEmployees = participants?.length || 0;
  const completedParticipants =
    participants?.filter((p) => p.status === 'completed') || [];
  const pendingAssessments =
    participants?.filter(
      (p) => p.status === 'invited' || p.status === 'opened' || p.status === 'started'
    ).length || 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const completedThisMonth = completedParticipants.filter((p) => {
    if (!p.completed_at) return false;
    return new Date(p.completed_at) >= startOfMonth;
  }).length;

  const completionRate =
    totalEmployees > 0
      ? Math.round((completedParticipants.length / totalEmployees) * 100)
      : 0;

  let averageScore: number | null = null;
  if (completedParticipants.length > 0) {
    const participantIds = completedParticipants.map((p) => p.id);

    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('id')
      .in('campaign_participant_id', participantIds);

    if (attempts && attempts.length > 0) {
      const attemptIds = attempts.map((a) => a.id);

      const { data: scores } = await supabase
        .from('assessment_scores')
        .select('total_score')
        .in('attempt_id', attemptIds);

      if (scores && scores.length > 0) {
        const sum = scores.reduce((acc, s) => acc + s.total_score, 0);
        averageScore = Math.round(sum / scores.length);
      }
    }
  }

  return {
    totalCampaigns,
    totalEmployees,
    pendingAssessments,
    completedThisMonth,
    averageScore,
    completionRate,
  };
}

export async function getSkillBreakdown(
  organizationId: string
): Promise<SkillBreakdown | null> {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('organization_id', organizationId);

  if (!campaigns || campaigns.length === 0) return null;

  const campaignIds = campaigns.map((c) => c.id);

  const { data: participants } = await supabase
    .from('campaign_participants')
    .select('id')
    .in('campaign_id', campaignIds)
    .eq('status', 'completed');

  if (!participants || participants.length === 0) return null;

  const participantIds = participants.map((p) => p.id);

  const { data: attempts } = await supabase
    .from('assessment_attempts')
    .select('id')
    .in('campaign_participant_id', participantIds);

  if (!attempts || attempts.length === 0) return null;

  const attemptIds = attempts.map((a) => a.id);

  const { data: scores } = await supabase
    .from('assessment_scores')
    .select(
      'clarity_score, context_score, constraints_score, output_format_score, verification_score'
    )
    .in('attempt_id', attemptIds);

  if (!scores || scores.length === 0) return null;

  const count = scores.length;
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

  return {
    clarity: Math.round(totals.clarity / count),
    context: Math.round(totals.context / count),
    constraints: Math.round(totals.constraints / count),
    outputFormat: Math.round(totals.outputFormat / count),
    verification: Math.round(totals.verification / count),
  };
}

export async function getScoreDistribution(
  organizationId: string
): Promise<ScoreDistribution> {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('organization_id', organizationId);

  if (!campaigns || campaigns.length === 0) {
    return { atRisk: 0, basic: 0, functional: 0, strong: 0, expert: 0 };
  }

  const campaignIds = campaigns.map((c) => c.id);

  const { data: participants } = await supabase
    .from('campaign_participants')
    .select('id')
    .in('campaign_id', campaignIds)
    .eq('status', 'completed');

  if (!participants || participants.length === 0) {
    return { atRisk: 0, basic: 0, functional: 0, strong: 0, expert: 0 };
  }

  const participantIds = participants.map((p) => p.id);

  const { data: attempts } = await supabase
    .from('assessment_attempts')
    .select('id')
    .in('campaign_participant_id', participantIds);

  if (!attempts || attempts.length === 0) {
    return { atRisk: 0, basic: 0, functional: 0, strong: 0, expert: 0 };
  }

  const attemptIds = attempts.map((a) => a.id);

  const { data: scores } = await supabase
    .from('assessment_scores')
    .select('score_band')
    .in('attempt_id', attemptIds);

  if (!scores || scores.length === 0) {
    return { atRisk: 0, basic: 0, functional: 0, strong: 0, expert: 0 };
  }

  const distribution: ScoreDistribution = {
    atRisk: 0,
    basic: 0,
    functional: 0,
    strong: 0,
    expert: 0,
  };

  scores.forEach((s) => {
    switch (s.score_band) {
      case 'at_risk':
        distribution.atRisk++;
        break;
      case 'basic':
        distribution.basic++;
        break;
      case 'functional':
        distribution.functional++;
        break;
      case 'strong':
        distribution.strong++;
        break;
      case 'expert':
        distribution.expert++;
        break;
    }
  });

  return distribution;
}

export async function getRecentCompletions(
  organizationId: string,
  limit: number = 5
): Promise<RecentCompletion[]> {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('organization_id', organizationId);

  if (!campaigns || campaigns.length === 0) return [];

  const campaignIds = campaigns.map((c) => c.id);
  const campaignMap = new Map(campaigns.map((c) => [c.id, c.name]));

  const { data: participants } = await supabase
    .from('campaign_participants')
    .select(
      `
      id,
      campaign_id,
      completed_at,
      employee:employees(email)
    `
    )
    .in('campaign_id', campaignIds)
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit * 2);

  if (!participants || participants.length === 0) return [];

  const participantIds = participants.map((p) => p.id);

  const { data: attempts } = await supabase
    .from('assessment_attempts')
    .select('id, campaign_participant_id')
    .in('campaign_participant_id', participantIds);

  if (!attempts || attempts.length === 0) return [];

  const attemptMap = new Map(
    attempts.map((a) => [a.campaign_participant_id, a.id])
  );
  const attemptIds = attempts.map((a) => a.id);

  const { data: scores } = await supabase
    .from('assessment_scores')
    .select('attempt_id, total_score, score_band')
    .in('attempt_id', attemptIds);

  if (!scores || scores.length === 0) return [];

  const scoreMap = new Map(scores.map((s) => [s.attempt_id, s]));

  const results: RecentCompletion[] = [];

  for (const p of participants) {
    if (results.length >= limit) break;

    const attemptId = attemptMap.get(p.id);
    if (!attemptId) continue;

    const score = scoreMap.get(attemptId);
    if (!score) continue;

    const employeeData = p.employee as { email: string } | { email: string }[] | null;
    const employee = Array.isArray(employeeData) ? employeeData[0] : employeeData;
    if (!employee) continue;

    results.push({
      id: p.id,
      employeeEmail: employee.email,
      campaignName: campaignMap.get(p.campaign_id) || 'Unknown',
      score: score.total_score,
      scoreBand: score.score_band as ScoreBand,
      completedAt: p.completed_at!,
    });
  }

  return results;
}

export async function getCommonWeaknesses(
  organizationId: string
): Promise<CommonWeakness[]> {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('organization_id', organizationId);

  if (!campaigns || campaigns.length === 0) return [];

  const campaignIds = campaigns.map((c) => c.id);

  const { data: participants } = await supabase
    .from('campaign_participants')
    .select('id')
    .in('campaign_id', campaignIds)
    .eq('status', 'completed');

  if (!participants || participants.length === 0) return [];

  const participantIds = participants.map((p) => p.id);

  const { data: attempts } = await supabase
    .from('assessment_attempts')
    .select('id')
    .in('campaign_participant_id', participantIds);

  if (!attempts || attempts.length === 0) return [];

  const attemptIds = attempts.map((a) => a.id);

  const { data: scores } = await supabase
    .from('assessment_scores')
    .select(
      'clarity_score, context_score, constraints_score, output_format_score, verification_score'
    )
    .in('attempt_id', attemptIds);

  if (!scores || scores.length === 0) return [];

  const count = scores.length;
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

  const criteria: CommonWeakness[] = [
    {
      criterion: 'clarity',
      label: 'Clarity',
      averageScore: Math.round(totals.clarity / count),
    },
    {
      criterion: 'context',
      label: 'Context',
      averageScore: Math.round(totals.context / count),
    },
    {
      criterion: 'constraints',
      label: 'Constraints',
      averageScore: Math.round(totals.constraints / count),
    },
    {
      criterion: 'outputFormat',
      label: 'Output Format',
      averageScore: Math.round(totals.outputFormat / count),
    },
    {
      criterion: 'verification',
      label: 'Verification',
      averageScore: Math.round(totals.verification / count),
    },
  ];

  return criteria.sort((a, b) => a.averageScore - b.averageScore);
}

export async function getTopPerformers(
  organizationId: string,
  limit: number = 5
): Promise<TopPerformer[]> {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('organization_id', organizationId);

  if (!campaigns || campaigns.length === 0) return [];

  const campaignIds = campaigns.map((c) => c.id);
  const campaignMap = new Map(campaigns.map((c) => [c.id, c.name]));

  const { data: participants } = await supabase
    .from('campaign_participants')
    .select(`
      id,
      campaign_id,
      employee:employees(email)
    `)
    .in('campaign_id', campaignIds)
    .eq('status', 'completed');

  if (!participants || participants.length === 0) return [];

  const participantIds = participants.map((p) => p.id);

  const { data: attempts } = await supabase
    .from('assessment_attempts')
    .select('id, campaign_participant_id')
    .in('campaign_participant_id', participantIds);

  if (!attempts || attempts.length === 0) return [];

  const attemptMap = new Map(
    attempts.map((a) => [a.campaign_participant_id, a.id])
  );
  const attemptIds = attempts.map((a) => a.id);

  const { data: scores } = await supabase
    .from('assessment_scores')
    .select('attempt_id, total_score, score_band')
    .in('attempt_id', attemptIds)
    .order('total_score', { ascending: false });

  if (!scores || scores.length === 0) return [];

  const scoreMap = new Map(scores.map((s) => [s.attempt_id, s]));

  const participantsWithScores = participants
    .map((p) => {
      const attemptId = attemptMap.get(p.id);
      if (!attemptId) return null;

      const score = scoreMap.get(attemptId);
      if (!score) return null;

      const employeeData = p.employee as { email: string } | { email: string }[] | null;
      const employee = Array.isArray(employeeData) ? employeeData[0] : employeeData;
      if (!employee) return null;

      return {
        id: p.id,
        employeeEmail: employee.email,
        campaignName: campaignMap.get(p.campaign_id) || 'Unknown',
        score: score.total_score,
        scoreBand: score.score_band as ScoreBand,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((p, index) => ({
      ...p,
      rank: index + 1,
    }));

  return participantsWithScores;
}

export async function getCampaignComparison(
  organizationId: string
): Promise<CampaignComparison[]> {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (!campaigns || campaigns.length === 0) return [];

  const results: CampaignComparison[] = [];
  let previousScore: number | null = null;

  for (const campaign of campaigns) {
    const { data: participants } = await supabase
      .from('campaign_participants')
      .select('id, status')
      .eq('campaign_id', campaign.id);

    const totalCount = participants?.length || 0;
    const completedParticipants = participants?.filter((p) => p.status === 'completed') || [];
    const completedCount = completedParticipants.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    let averageScore: number | null = null;

    if (completedCount > 0) {
      const participantIds = completedParticipants.map((p) => p.id);

      const { data: attempts } = await supabase
        .from('assessment_attempts')
        .select('id')
        .in('campaign_participant_id', participantIds);

      if (attempts && attempts.length > 0) {
        const attemptIds = attempts.map((a) => a.id);

        const { data: scores } = await supabase
          .from('assessment_scores')
          .select('total_score')
          .in('attempt_id', attemptIds);

        if (scores && scores.length > 0) {
          const sum = scores.reduce((acc, s) => acc + s.total_score, 0);
          averageScore = Math.round(sum / scores.length);
        }
      }
    }

    let trend: 'up' | 'down' | 'same' | null = null;
    if (previousScore !== null && averageScore !== null) {
      if (averageScore > previousScore) trend = 'up';
      else if (averageScore < previousScore) trend = 'down';
      else trend = 'same';
    }

    results.push({
      id: campaign.id,
      name: campaign.name,
      averageScore,
      completedCount,
      totalCount,
      completionRate,
      createdAt: campaign.created_at,
      trend,
    });

    if (averageScore !== null) {
      previousScore = averageScore;
    }
  }

  return results;
}

export async function getEmployeeProgressHistory(
  organizationId: string,
  limit: number = 5
): Promise<EmployeeProgress[]> {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (!campaigns || campaigns.length === 0) return [];

  const campaignIds = campaigns.map((c) => c.id);
  const campaignMap = new Map(campaigns.map((c) => [c.id, { name: c.name, date: c.created_at }]));

  const { data: participants } = await supabase
    .from('campaign_participants')
    .select(`
      id,
      campaign_id,
      completed_at,
      employee:employees(id, email)
    `)
    .in('campaign_id', campaignIds)
    .eq('status', 'completed');

  if (!participants || participants.length === 0) return [];

  const participantIds = participants.map((p) => p.id);

  const { data: attempts } = await supabase
    .from('assessment_attempts')
    .select('id, campaign_participant_id')
    .in('campaign_participant_id', participantIds);

  if (!attempts || attempts.length === 0) return [];

  const attemptMap = new Map(attempts.map((a) => [a.campaign_participant_id, a.id]));
  const attemptIds = attempts.map((a) => a.id);

  const { data: scores } = await supabase
    .from('assessment_scores')
    .select('attempt_id, total_score')
    .in('attempt_id', attemptIds);

  if (!scores || scores.length === 0) return [];

  const scoreMap = new Map(scores.map((s) => [s.attempt_id, s.total_score]));

  const employeeAssessments = new Map<string, { email: string; assessments: { campaignName: string; score: number; completedAt: string; campaignDate: string }[] }>();

  for (const p of participants) {
    const employeeData = p.employee as { id: string; email: string } | { id: string; email: string }[] | null;
    const employee = Array.isArray(employeeData) ? employeeData[0] : employeeData;
    if (!employee) continue;

    const attemptId = attemptMap.get(p.id);
    if (!attemptId) continue;

    const score = scoreMap.get(attemptId);
    if (score === undefined) continue;

    const campaignInfo = campaignMap.get(p.campaign_id);
    if (!campaignInfo) continue;

    if (!employeeAssessments.has(employee.email)) {
      employeeAssessments.set(employee.email, { email: employee.email, assessments: [] });
    }

    employeeAssessments.get(employee.email)!.assessments.push({
      campaignName: campaignInfo.name,
      score,
      completedAt: p.completed_at!,
      campaignDate: campaignInfo.date,
    });
  }

  const employeesWithMultiple = Array.from(employeeAssessments.values())
    .filter((e) => e.assessments.length > 1)
    .map((e) => {
      e.assessments.sort((a, b) => new Date(a.campaignDate).getTime() - new Date(b.campaignDate).getTime());
      
      const firstScore = e.assessments[0].score;
      const lastScore = e.assessments[e.assessments.length - 1].score;
      const improvement = lastScore - firstScore;

      return {
        employeeEmail: e.email,
        assessments: e.assessments.map(({ campaignName, score, completedAt }) => ({
          campaignName,
          score,
          completedAt,
        })),
        improvement,
      };
    })
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, limit);

  return employeesWithMultiple;
}

export async function getScoreTrend(
  organizationId: string
): Promise<ScoreTrendPoint[]> {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (!campaigns || campaigns.length === 0) return [];

  const results: ScoreTrendPoint[] = [];

  for (const campaign of campaigns) {
    const { data: participants } = await supabase
      .from('campaign_participants')
      .select('id')
      .eq('campaign_id', campaign.id)
      .eq('status', 'completed');

    if (!participants || participants.length === 0) continue;

    const participantIds = participants.map((p) => p.id);

    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('id')
      .in('campaign_participant_id', participantIds);

    if (!attempts || attempts.length === 0) continue;

    const attemptIds = attempts.map((a) => a.id);

    const { data: scores } = await supabase
      .from('assessment_scores')
      .select('total_score')
      .in('attempt_id', attemptIds);

    if (!scores || scores.length === 0) continue;

    const sum = scores.reduce((acc, s) => acc + s.total_score, 0);
    const averageScore = Math.round(sum / scores.length);

    results.push({
      campaignName: campaign.name,
      averageScore,
      date: campaign.created_at,
    });
  }

  return results;
}
