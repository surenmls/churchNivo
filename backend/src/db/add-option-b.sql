ALTER TABLE churches ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

UPDATE churches SET onboarding_completed = true WHERE onboarding_completed IS NULL OR description IS NOT NULL;
