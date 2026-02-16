-- F9-005: Pantry Tracker
-- Allows users to mark ingredients they already have at home.
-- Shopping list can subtract pantry items.

CREATE TABLE IF NOT EXISTS pantry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  amount numeric,
  unit text,
  category text DEFAULT 'Other',
  added_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id, ingredient_name, unit)
);

CREATE INDEX idx_pantry_items_user ON pantry_items(user_id);

-- RLS
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pantry items"
  ON pantry_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pantry items"
  ON pantry_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pantry items"
  ON pantry_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pantry items"
  ON pantry_items FOR DELETE
  USING (auth.uid() = user_id);
