-- Grant 5 free trial credits to every new organization on signup.
-- The trigger also records the grant as a credit_transaction so it's visible in
-- billing history and can be used to detect whether the trial was already granted.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_name TEXT;
  user_full_name TEXT;
BEGIN
  org_name := NEW.raw_user_meta_data->>'organization_name';
  user_full_name := NEW.raw_user_meta_data->>'full_name';

  IF org_name IS NULL OR org_name = '' THEN
    RAISE EXCEPTION 'organization_name is required in user metadata';
  END IF;

  IF user_full_name IS NULL OR user_full_name = '' THEN
    RAISE EXCEPTION 'full_name is required in user metadata';
  END IF;

  new_org_id := gen_random_uuid();

  -- Create organization with 5 free trial credits pre-loaded
  INSERT INTO public.organizations (id, name, credit_balance)
  VALUES (new_org_id, org_name, 5);

  -- Record the trial grant so billing history shows it
  INSERT INTO public.credit_transactions (organization_id, amount, type, description)
  VALUES (new_org_id, 5, 'adjustment', 'Free trial — 5 credits');

  INSERT INTO public.admin_profiles (user_id, organization_id, full_name, email, role)
  VALUES (NEW.id, new_org_id, user_full_name, NEW.email, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
