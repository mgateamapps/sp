import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { notFound } from 'next/navigation';
import type { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ campaignId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { campaignId } = await params;

  const admin = await getCurrentAdminProfile();
  if (!admin) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createAdminClient();

  // Verify campaign belongs to this organization
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name, organization_id')
    .eq('id', campaignId)
    .single();

  if (!campaign || campaign.organization_id !== admin.organization_id) {
    notFound();
  }

  // Fetch all participants with their scores
  const { data: participants } = await supabase
    .from('campaign_participants')
    .select(`
      id, status, invited_at, started_at, completed_at,
      employee:employees(email, full_name),
      assessment_attempts(
        id, status,
        assessment_scores(
          total_score, score_band,
          clarity_score, context_score, constraints_score,
          output_format_score, verification_score
        )
      )
    `)
    .eq('campaign_id', campaignId)
    .order('invited_at', { ascending: true });

  if (!participants) {
    return new Response('No data', { status: 404 });
  }

  const rows: string[] = [
    [
      'Email',
      'Full Name',
      'Status',
      'Total Score',
      'Score Band',
      'Clarity (/20)',
      'Context (/20)',
      'Constraints (/20)',
      'Output Format (/20)',
      'Verification (/20)',
      'Invited At',
      'Completed At',
    ]
      .map(escapeCsv)
      .join(','),
  ];

  for (const p of participants) {
    const employeeRaw = p.employee as { email: string; full_name: string | null } | { email: string; full_name: string | null }[] | null;
    const employee = Array.isArray(employeeRaw) ? employeeRaw[0] : employeeRaw;

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
    const score = attempt?.assessment_scores?.[0] ?? null;

    rows.push(
      [
        employee?.email ?? '',
        employee?.full_name ?? '',
        p.status,
        score ? String(score.total_score) : '',
        score ? score.score_band : '',
        score ? String(score.clarity_score) : '',
        score ? String(score.context_score) : '',
        score ? String(score.constraints_score) : '',
        score ? String(score.output_format_score) : '',
        score ? String(score.verification_score) : '',
        p.invited_at ? formatCsvDate(p.invited_at) : '',
        p.completed_at ? formatCsvDate(p.completed_at) : '',
      ]
        .map(escapeCsv)
        .join(',')
    );
  }

  const csv = rows.join('\r\n');
  const filename = `${campaign.name.replace(/[^a-zA-Z0-9-_]/g, '_')}_results.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCsvDate(iso: string): string {
  return new Date(iso).toISOString().replace('T', ' ').slice(0, 19);
}
