'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAdminProfile } from '@/lib/queries/admin';

export interface SettingsResult {
  success: boolean;
  error?: string;
  url?: string;
}

export async function updateProfile(formData: FormData): Promise<SettingsResult> {
  const fullName = (formData.get('full_name') as string)?.trim();
  if (!fullName) return { success: false, error: 'Name is required' };

  const supabase = await createClient();
  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('admin_profiles')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('user_id', admin.user_id);

  if (error) return { success: false, error: 'Failed to update profile' };

  revalidatePath('/app/settings');
  revalidatePath('/app/campaigns');
  return { success: true };
}

export async function updatePassword(formData: FormData): Promise<SettingsResult> {
  const newPassword = formData.get('new_password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function uploadAvatar(formData: FormData): Promise<SettingsResult> {
  const file = formData.get('file') as File;
  if (!file || file.size === 0) return { success: false, error: 'No file provided' };
  if (file.size > 5 * 1024 * 1024) return { success: false, error: 'Max file size is 5MB' };
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG or WebP allowed' };
  }

  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: 'Not authenticated' };

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `users/${admin.user_id}/avatar.${ext}`;
  const bytes = await file.arrayBuffer();

  const adminSupabase = createAdminClient();
  const { error: uploadError } = await adminSupabase.storage
    .from('avatars')
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) return { success: false, error: 'Upload failed: ' + uploadError.message };

  const { data: { publicUrl } } = adminSupabase.storage.from('avatars').getPublicUrl(path);

  const supabase = await createClient();
  await supabase
    .from('admin_profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('user_id', admin.user_id);

  // Sync to auth metadata so header dropdown picks it up immediately
  await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

  revalidatePath('/app/campaigns');
  revalidatePath('/app/settings');
  return { success: true, url: publicUrl };
}

export async function updateOrganization(formData: FormData): Promise<SettingsResult> {
  const name = (formData.get('name') as string)?.trim();
  if (!name) return { success: false, error: 'Company name is required' };

  const supabase = await createClient();
  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('organizations')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', admin.organization_id);

  if (error) return { success: false, error: 'Failed to update organization' };

  revalidatePath('/app/settings');
  return { success: true };
}

export async function uploadLogo(formData: FormData): Promise<SettingsResult> {
  const file = formData.get('file') as File;
  if (!file || file.size === 0) return { success: false, error: 'No file provided' };
  if (file.size > 5 * 1024 * 1024) return { success: false, error: 'Max file size is 5MB' };
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG or WebP allowed' };
  }

  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: 'Not authenticated' };

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `orgs/${admin.organization_id}/logo.${ext}`;
  const bytes = await file.arrayBuffer();

  const adminSupabase = createAdminClient();
  const { error: uploadError } = await adminSupabase.storage
    .from('avatars')
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) return { success: false, error: 'Upload failed: ' + uploadError.message };

  const { data: { publicUrl } } = adminSupabase.storage.from('avatars').getPublicUrl(path);

  const supabase = await createClient();
  await supabase
    .from('organizations')
    .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', admin.organization_id);

  revalidatePath('/app/settings');
  return { success: true, url: publicUrl };
}

export async function updateInviteSettings(formData: FormData): Promise<SettingsResult> {
  const inviteMessage = (formData.get('invite_message') as string)?.trim() || null;
  const inviteReplyTo = (formData.get('invite_reply_to') as string)?.trim() || null;

  if (inviteReplyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteReplyTo)) {
    return { success: false, error: 'Invalid reply-to email address' };
  }

  const supabase = await createClient();
  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('organizations')
    .update({
      invite_message: inviteMessage,
      invite_reply_to: inviteReplyTo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', admin.organization_id);

  if (error) return { success: false, error: 'Failed to update invite settings' };

  revalidatePath('/app/settings');
  return { success: true };
}
