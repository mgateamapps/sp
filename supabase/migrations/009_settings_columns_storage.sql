-- Migration: Add settings columns and storage bucket

-- Add avatar_url to admin_profiles
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add settings columns to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invite_message TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invite_reply_to TEXT;

-- Create storage bucket for avatars and logos (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
