import { createClient } from "../utils/supabase/client";

export type PresetCustomIR = { url: string; distance: number };
export interface Preset {
  id: number;
  name: string;
  description: string;
  knobs_values: Record<string, number>;
  created_at?: Date;
  published: boolean;
  user_id: string;
  user: {
    id: string;
    username: string;
  };
  model_id: string;
  custom_ir?: PresetCustomIR;
}

const PRESET_SELECT = `
  id,
  name,
  description,
  knobs_values,
  created_at,
  published,
  user_id,
  user: user_id (
    id, username
  ),
  model_id,
  custom_ir
`;

export interface GetPresetsOptions {
  userId?: string;
}

const supabase = createClient();

const getPreset = async (presetId: number): Promise<Preset> => {
  const { error, data: preset } = await supabase
    .from("presets")
    .select(PRESET_SELECT)
    .eq("id", presetId)
    .single();

  if (preset) {
    return preset as unknown as Preset;
  }

  throw error ?? new Error("Preset not found");
};

const getPresets = async ({ userId }: GetPresetsOptions = {}): Promise<
  Preset[]
> => {
  let query = supabase.from("presets").select(PRESET_SELECT);
  if (userId) {
    query = query.eq("user_id", userId);
  }
  const { error, data: presets } = await query;
  if (presets) {
    return presets as unknown as Preset[];
  }

  throw error ?? new Error("Failed to load presets");
};

const createPreset = async (presetToInset: Omit<Preset, "id" | "user">) => {
  const { error, data: preset } = await supabase
    .from("presets")
    .insert({
      ...presetToInset,
    })
    .select(PRESET_SELECT)
    .single();

  if (preset) {
    return preset as unknown as Preset;
  }

  throw error ?? new Error("Failed to create preset");
};

const updatePreset = async (presetToUpdate: Omit<Preset, "user">) => {
  const { error, data: preset } = await supabase
    .from("presets")
    .update({
      ...presetToUpdate,
    })
    .eq("id", presetToUpdate.id)
    .select(PRESET_SELECT)
    .single();

  if (preset) {
    return preset as unknown as Preset;
  }

  throw error ?? new Error("Failed to update preset");
};

const deletePreset = async (presetId: number) => {
  const { error, data: preset } = await supabase
    .from("presets")
    .delete()
    .eq("id", presetId)
    .select(PRESET_SELECT)
    .single();

  if (preset) {
    return preset as unknown as Preset;
  }

  throw error ?? new Error("Failed to delete preset");
};

export const PresetService = {
  getPresets,
  createPreset,
  getPreset,
  deletePreset,
  updatePreset,
};
