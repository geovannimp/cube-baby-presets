import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";

export type PresetCustomIR = { url: string; distance: number };
export interface Preset {
  id: number;
  name: string;
  description: string;
  knobs_values: Record<string, number>;
  created_at?: Date;
  published: boolean;
  user_id: string;
  model_id: string;
  custom_ir?: PresetCustomIR;
}
export interface GetPresetsOptions {
  userId?: string;
}

const getPreset = async (presetId: number): Promise<Preset> => {
  const { error, data: preset } = await supabaseClient
    .from<Preset>("presets")
    .select()
    .eq("id", presetId)
    .single();

  if (preset) {
    return preset;
  } else {
    throw error;
  }
};

const getPresets = async ({ userId }: GetPresetsOptions = {}): Promise<
  Preset[]
> => {
  let query = supabaseClient.from<Preset>("presets").select();
  if (userId) {
    query = query.eq("user_id", userId);
  }
  const { error, data: presets } = await query;
  if (presets) {
    return presets;
  } else {
    throw error;
  }
};

const createPreset = async (presetToInset: Omit<Preset, "id">) => {
  const { error, body: preset } = await supabaseClient
    .from<Preset>("presets")
    .insert({
      ...presetToInset,
    })
    .single();

  if (preset) {
    return preset;
  } else {
    throw error;
  }
};

const updatePreset = async (presetToUpdate: Preset) => {
  const { error, body: preset } = await supabaseClient
    .from<Preset>("presets")
    .update({
      ...presetToUpdate,
    })
    .eq("id", presetToUpdate.id)
    .single();

  if (preset) {
    return preset;
  } else {
    throw error;
  }
};

const deletePreset = async (presetId: number) => {
  const { error, data: preset } = await supabaseClient
    .from<Preset>("presets")
    .delete()
    .eq("id", presetId)
    .single();

  if (preset) {
    return preset;
  } else {
    throw error;
  }
};

export const PresetService = {
  getPresets,
  createPreset,
  getPreset,
  deletePreset,
  updatePreset,
};
