import { createClient } from "../utils/supabase/client";

export type VoteValue = 1 | -1;

export const LIKE = 1;

export const DISLIKE = -1;

export type PresetVote = { preset_id: number; value: VoteValue };

const VOTE_SELECT = "preset_id, value";

const getSupabase = () => createClient();

const getUserVote = async (
  presetId: number,
  userId: string
): Promise<PresetVote | null> => {
  const { error, data } = await getSupabase()
    .from("preset_votes")
    .select(VOTE_SELECT)
    .eq("preset_id", presetId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as PresetVote | null) ?? null;
};

// Upsert keeps one vote per user per preset: voting again after switching
// replaces the previous value instead of adding a second row.
const votePreset = async ({
  presetId,
  userId,
  value,
}: {
  presetId: number;
  userId: string;
  value: VoteValue;
}): Promise<PresetVote> => {
  if (value !== LIKE && value !== DISLIKE) {
    throw new Error("Vote value must be 1 (like) or -1 (dislike)");
  }

  const { error, data } = await getSupabase()
    .from("preset_votes")
    .upsert(
      { preset_id: presetId, user_id: userId, value },
      { onConflict: "preset_id,user_id" }
    )
    .select(VOTE_SELECT)
    .single();

  if (data) {
    return data as PresetVote;
  }

  throw error ?? new Error("Failed to vote on preset");
};

const removeVote = async (presetId: number): Promise<void> => {
  const { error } = await getSupabase()
    .from("preset_votes")
    .delete()
    .eq("preset_id", presetId);

  if (error) {
    throw error;
  }
};

export const VoteService = {
  getUserVote,
  votePreset,
  removeVote,
};
