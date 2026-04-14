import type { ScoreBand } from '@/types';

export function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getBandVariant(
  band: ScoreBand
): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
  switch (band) {
    case 'expert':
    case 'strong':
      return 'success';
    case 'functional':
      return 'info';
    case 'basic':
      return 'warning';
    case 'at_risk':
      return 'danger';
    default:
      return 'secondary';
  }
}

export function formatBandLabel(band: ScoreBand): string {
  switch (band) {
    case 'at_risk':
      return 'At Risk';
    case 'basic':
      return 'Basic';
    case 'functional':
      return 'Functional';
    case 'strong':
      return 'Strong';
    case 'expert':
      return 'Expert';
    default:
      return band;
  }
}

/** Campaign status → Badge variant */
export function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'closed':
      return 'secondary';
    default:
      return 'outline';
  }
}

/** Campaign participant status → Badge variant */
export function getParticipantStatusBadge(
  status: string
): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'started':
      return 'secondary';
    default:
      return 'outline';
  }
}
