import { createClient } from '@/lib/supabase/server';
import type { AdminProfile, Organization } from '@/types';

export async function getCurrentAdminProfile(): Promise<AdminProfile | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;
  
  return data as AdminProfile;
}

export async function getCurrentOrganization(): Promise<Organization | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return null;

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();

  if (error || !data) return null;
  
  return data as Organization;
}

export async function getAdminWithOrganization(): Promise<{
  admin: AdminProfile;
  organization: Organization;
} | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) return null;

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();

  if (orgError || !org) return null;

  return {
    admin: profile as AdminProfile,
    organization: org as Organization,
  };
}
