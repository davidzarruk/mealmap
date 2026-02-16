/**
 * F10-005: Household / Family Sharing Service
 *
 * Manage household members: invite by email, accept/decline, list members.
 */

import { supabase } from './supabase';

// ─── Types ───

export type HouseholdRole = 'viewer' | 'editor' | 'admin';
export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export type HouseholdMember = {
  id: string;
  owner_id: string;
  member_email: string;
  member_user_id: string | null;
  role: HouseholdRole;
  status: InvitationStatus;
  invited_at: string;
  accepted_at: string | null;
};

// ─── Owner Actions ───

export async function getHouseholdMembers(): Promise<HouseholdMember[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('household_members')
    .select('*')
    .eq('owner_id', user.id)
    .order('invited_at', { ascending: false });

  return (data ?? []) as HouseholdMember[];
}

export async function inviteByEmail(
  email: string,
  role: HouseholdRole = 'viewer',
): Promise<HouseholdMember | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const normalizedEmail = email.trim().toLowerCase();

  // Check if already invited
  const { data: existing } = await supabase
    .from('household_members')
    .select('id')
    .eq('owner_id', user.id)
    .eq('member_email', normalizedEmail)
    .single();

  if (existing) return null; // Already invited

  const { data, error } = await supabase
    .from('household_members')
    .insert({
      owner_id: user.id,
      member_email: normalizedEmail,
      role,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) return null;
  return data as HouseholdMember;
}

export async function removeMember(memberId: string): Promise<void> {
  await supabase.from('household_members').delete().eq('id', memberId);
}

export async function updateMemberRole(memberId: string, role: HouseholdRole): Promise<void> {
  await supabase.from('household_members').update({ role }).eq('id', memberId);
}

// ─── Member Actions ───

export async function getMyInvitations(): Promise<HouseholdMember[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('household_members')
    .select('*')
    .or(`member_user_id.eq.${user.id},member_email.eq.${user.email}`)
    .eq('status', 'pending')
    .order('invited_at', { ascending: false });

  return (data ?? []) as HouseholdMember[];
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('household_members')
    .update({
      status: 'accepted',
      member_user_id: user.id,
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invitationId);
}

export async function declineInvitation(invitationId: string): Promise<void> {
  await supabase
    .from('household_members')
    .update({ status: 'declined' })
    .eq('id', invitationId);
}

// ─── Shared Plans ───

/**
 * Get plan IDs shared with the current user (from households they belong to).
 */
export async function getSharedPlanOwnerIds(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('household_members')
    .select('owner_id')
    .or(`member_user_id.eq.${user.id},member_email.eq.${user.email}`)
    .eq('status', 'accepted');

  return (data ?? []).map((r) => r.owner_id as string);
}
