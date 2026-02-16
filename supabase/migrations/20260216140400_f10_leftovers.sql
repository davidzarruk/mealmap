-- F10-007: Leftover Tracker
-- Track leftover meals/ingredients and suggest recipes

CREATE TABLE IF NOT EXISTS leftovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  amount numeric,
  unit text,
  source_meal text,
  stored_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  notes text
);

CREATE INDEX idx_leftovers_user ON leftovers(user_id);
CREATE INDEX idx_leftovers_active ON leftovers(user_id, used) WHERE used = false;

-- RLS
ALTER TABLE leftovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own leftovers"
  ON leftovers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
