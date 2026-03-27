-- Migration: Create organizations and admin_profiles tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins can only see their own organization
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own organization" ON organizations
  FOR UPDATE USING (
    id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

-- RLS Policies: Admins can only see/update their own profile
CREATE POLICY "Users can view own profile" ON admin_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON admin_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Trigger function to create org + profile on signup
-- NOTE: Requires full_name and organization_name in user metadata (set by signup form)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_name TEXT;
  user_full_name TEXT;
BEGIN
  -- Extract metadata (signup form ensures these are present)
  org_name := NEW.raw_user_meta_data->>'organization_name';
  user_full_name := NEW.raw_user_meta_data->>'full_name';
  
  -- Validate required fields - fail clearly if missing
  IF org_name IS NULL OR org_name = '' THEN
    RAISE EXCEPTION 'organization_name is required in user metadata';
  END IF;
  
  IF user_full_name IS NULL OR user_full_name = '' THEN
    RAISE EXCEPTION 'full_name is required in user metadata';
  END IF;

  -- Create organization
  new_org_id := gen_random_uuid();
  
  INSERT INTO public.organizations (id, name)
  VALUES (new_org_id, org_name);
  
  -- Create admin profile linked to the new organization
  INSERT INTO public.admin_profiles (user_id, organization_id, full_name, email, role)
  VALUES (NEW.id, new_org_id, user_full_name, NEW.email, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
