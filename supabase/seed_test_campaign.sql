-- Seed: Test campaign with 150 participants
-- Run this in Supabase SQL Editor (runs as postgres, bypasses RLS)
-- Creates: 1 campaign, 150 employees, varied statuses + scores for completed ones

DO $$
DECLARE
  v_org_id        UUID;
  v_campaign_id   UUID;
  v_employee_id   UUID;
  v_participant_id UUID;
  v_attempt_id    UUID;
  v_score         INTEGER;
  v_band          TEXT;
  v_completed_at  TIMESTAMPTZ;
  i               INTEGER;
  v_email         TEXT;
  v_first         TEXT;
  v_last          TEXT;

  first_names TEXT[] := ARRAY[
    'Alice','Bob','Charlie','Diana','Eve','Frank','Grace','Hank','Iris','Jack',
    'Karen','Leo','Mia','Nina','Oscar','Paula','Quinn','Ron','Sara','Tom',
    'Uma','Victor','Wendy','Xander','Yara','Zoe','Aaron','Beth','Carl','Donna'
  ];
  last_names TEXT[] := ARRAY[
    'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
    'Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas',
    'Taylor','Moore','Jackson','Martin','Lee'
  ];
BEGIN
  -- Pick org from first admin profile
  SELECT organization_id INTO v_org_id
  FROM admin_profiles
  LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found in admin_profiles';
  END IF;

  RAISE NOTICE 'org_id = %', v_org_id;

  -- Create the test campaign
  INSERT INTO campaigns (organization_id, name, description, status, domain)
  VALUES (
    v_org_id,
    'Engineering Team Assessment Q2 2026',
    'Stress-test campaign with 150 participants to validate pagination and search.',
    'active',
    'engineering'
  )
  RETURNING id INTO v_campaign_id;

  RAISE NOTICE 'campaign_id = %', v_campaign_id;

  -- Create 150 employees + participants
  FOR i IN 1..150 LOOP
    v_first := first_names[1 + ((i - 1) % array_length(first_names, 1))];
    v_last  := last_names [1 + ((i - 1) % array_length(last_names,  1))];
    v_email := lower(v_first) || '.' || lower(v_last) || i || '@testcorp.dev';

    -- Upsert employee
    INSERT INTO employees (organization_id, email, full_name)
    VALUES (v_org_id, v_email, v_first || ' ' || v_last)
    ON CONFLICT (organization_id, email)
    DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_employee_id;

    -- ── Status distribution ─────────────────────────────────────────────────
    --   1–40   → invited   (26 %)
    --  41–65   → started   (17 %)
    --  66–150  → completed (57 %)
    -- ────────────────────────────────────────────────────────────────────────

    IF i <= 40 THEN
      INSERT INTO campaign_participants (campaign_id, employee_id, status)
      VALUES (v_campaign_id, v_employee_id, 'invited');

    ELSIF i <= 65 THEN
      INSERT INTO campaign_participants (campaign_id, employee_id, status, started_at)
      VALUES (
        v_campaign_id, v_employee_id, 'started',
        NOW() - (random() * 5 * INTERVAL '1 day')
      );

    ELSE
      -- Completed: random date within last 20 days
      v_completed_at := NOW() - (random() * 20 * INTERVAL '1 day');

      INSERT INTO campaign_participants (campaign_id, employee_id, status, started_at, completed_at)
      VALUES (
        v_campaign_id, v_employee_id, 'completed',
        v_completed_at - INTERVAL '40 minutes',
        v_completed_at
      )
      RETURNING id INTO v_participant_id;

      -- Random score 25–100, weighted toward middle
      v_score := 25 + (random() * 75)::INTEGER;

      v_band := CASE
        WHEN v_score >= 85 THEN 'expert'
        WHEN v_score >= 70 THEN 'strong'
        WHEN v_score >= 50 THEN 'functional'
        WHEN v_score >= 30 THEN 'basic'
        ELSE 'at_risk'
      END;

      INSERT INTO assessment_attempts (campaign_participant_id, status, submitted_at, scored_at)
      VALUES (
        v_participant_id, 'scored',
        v_completed_at,
        v_completed_at + INTERVAL '90 seconds'
      )
      RETURNING id INTO v_attempt_id;

      INSERT INTO assessment_scores (
        attempt_id,
        clarity_score, context_score, constraints_score,
        output_format_score, verification_score,
        total_score, score_band,
        summary_feedback
      ) VALUES (
        v_attempt_id,
        LEAST(100, GREATEST(0, (v_score + (random() * 20 - 10))::INTEGER)),
        LEAST(100, GREATEST(0, (v_score + (random() * 20 - 10))::INTEGER)),
        LEAST(100, GREATEST(0, (v_score + (random() * 20 - 10))::INTEGER)),
        LEAST(100, GREATEST(0, (v_score + (random() * 20 - 10))::INTEGER)),
        LEAST(100, GREATEST(0, (v_score + (random() * 20 - 10))::INTEGER)),
        v_score,
        v_band,
        'Seeded test data — not a real assessment.'
      );
    END IF;

  END LOOP;

  RAISE NOTICE 'Done. Campaign "%" created with 150 participants: 40 invited, 25 started, 85 completed+scored.', v_campaign_id;
END $$;
