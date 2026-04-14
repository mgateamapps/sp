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

    for (const email of emails) {
      let { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('organization_id', admin.organization_id)
        .eq('email', email)
        .single();

      if (!employee) {
        const { data: newEmployee, error: employeeError } = await supabase
          .from('employees')
          .insert({
            organization_id: admin.organization_id,
            email: email,
          })
          .select()
          .single();

        if (employeeError || !newEmployee) {
          console.error(`Failed to create employee for ${email}:`, employeeError);
          continue;
        }
        employee = newEmployee;
      }

      if (!employee) {
        continue;
      }

      const { error: participantError } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: campaign.id,
          employee_id: employee.id,
          status: 'invited',
        });

      if (participantError) {
        console.error(`Failed to add participant ${email}:`, participantError);
      }
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
