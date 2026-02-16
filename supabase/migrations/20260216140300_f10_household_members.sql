-- F10-005: Household / Family Sharing
-- Share meal plans with household members via email invitation

CREATE TABLE IF NOT EXISTS household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email text NOT NULL,
  member_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(owner_id, member_email)
);

CREATE INDEX idx_household_owner ON household_members(owner_id);
CREATE INDEX idx_household_member ON household_members(member_user_id);
CREATE INDEX idx_household_email ON household_members(member_email);

-- RLS
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their household"
  ON household_members FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Members can view their invitations"
  ON household_members FOR SELECT
  USING (auth.uid() = member_user_id OR member_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Members can accept/decline invitations"
  ON household_members FOR UPDATE
  USING (auth.uid() = member_user_id OR member_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (auth.uid() = member_user_id OR member_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
