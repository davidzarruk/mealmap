-- F10-004: Plan Templates
-- Save weekly plans as reusable templates

CREATE TABLE IF NOT EXISTS plan_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  meals_json jsonb NOT NULL DEFAULT '{}',
  people_count integer NOT NULL DEFAULT 2,
  cooking_level text NOT NULL DEFAULT 'easy',
  region text NOT NULL DEFAULT 'CO',
  is_public boolean NOT NULL DEFAULT false,
  used_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_plan_templates_user ON plan_templates(user_id);
CREATE INDEX idx_plan_templates_public ON plan_templates(is_public) WHERE is_public = true;

-- RLS
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own templates"
  ON plan_templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own templates"
  ON plan_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON plan_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON plan_templates FOR DELETE
  USING (auth.uid() = user_id);
