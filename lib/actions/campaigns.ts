'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface CreateCampaignInput {
  name: string;
  description?: string;
  domain?: string;
  deadline?: string;
  employeeEmails: string[];
}

export interface CreateCampaignResult {
  success: boolean;
  campaignId?: string;
  error?: string;
}

function parseEmails(input: string): string[] {
  const emails = input
    .split(/[\n,;]+/)
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0)
    .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  
  return [...new Set(emails)];
}

export async function createCampaign(formData: FormData): Promise<CreateCampaignResult> {
  const supabase = await createClient();
  
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    return { success: false, error: 'Not authenticated' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const domain = (formData.get('domain') as string | null) || 'other';
  const deadline = formData.get('deadline') as string | null;
  const emailsRaw = formData.get('emails') as string;

  if (!name || name.trim().length < 2) {
    return { success: false, error: 'Campaign name is required (min 2 characters)' };
  }

  const emails = parseEmails(emailsRaw || '');
  if (emails.length === 0) {
    return { success: false, error: 'At least one valid email is required' };
  }

  try {
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        organization_id: admin.organization_id,
        name: name.trim(),
        description: description?.trim() || null,
        domain,
        deadline: deadline || null,
        status: 'draft',
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      return { success: false, error: 'Failed to create campaign' };
    }

    // Batch upsert all employees in one query (was 2-3 queries per email)
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .upsert(
        emails.map((email) => ({ organization_id: admin.organization_id, email })),
        { onConflict: 'organization_id,email' }
      )
      .select('id, email');

    if (employeesError || !employees || employees.length === 0) {
      console.error('Failed to upsert employees:', employeesError);
      return { success: false, error: 'Failed to add participants' };
    }

    // Batch insert all participants in one query
    const { error: participantsError } = await supabase
      .from('campaign_participants')
      .insert(
        employees.map((e) => ({
          campaign_id: campaign.id,
          employee_id: e.id,
          status: 'invited',
        }))
      );

    if (participantsError) {
      console.error('Failed to insert participants:', participantsError);
    }

    revalidatePath('/dashboard/campaigns');
    return { success: true, campaignId: campaign.id };
  } catch (error) {
    console.error('Create campaign error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createCampaignAndRedirect(formData: FormData): Promise<void> {
  const result = await createCampaign(formData);
  
  if (result.success && result.campaignId) {
    redirect(`/dashboard/campaigns/${result.campaignId}`);
  }
}
