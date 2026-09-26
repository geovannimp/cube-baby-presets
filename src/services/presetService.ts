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
  vote_up_count: number;
  vote_down_count: number;
}

export type PresetInput = Omit<Preset, "id" | "user" | "vote_up_count" | "vote_down_count">;

export type PresetSort = "recent" | "liked" | "disliked";

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
  custom_ir,
  vote_up_count,
  vote_down_count
`;

export const DEFAULT_PRESETS_PAGE_SIZE = 48;

export interface GetPresetsOptions {
  userId?: string;
  modelId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  asOf?: string;
  sort?: PresetSort;
}

export interface GetPresetsResult {
  presets: Preset[];
  totalCount: number;
}

export type PresetAuthor = {
  id: string;
  username: string;
};

const getSupabase = () => createClient();

const getPreset = async (presetId: number): Promise<Preset> => {
  const { error, data: preset } = await getSupabase()
    .from("presets")
    .select(PRESET_SELECT)
    .eq("id", presetId)
    .single();

  if (preset) {
    return preset as unknown as Preset;
  }

  throw error ?? new Error("Preset not found");
};

const getPresets = async ({
  userId,
  modelId,
  search,
  page = 1,
  pageSize = DEFAULT_PRESETS_PAGE_SIZE,
  asOf,
  sort = "recent",
}: GetPresetsOptions = {}): Promise<GetPresetsResult> => {
  const safePage = Math.max(page, 1);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = getSupabase()
    .from("presets")
    .select(PRESET_SELECT, { count: "exact" });

  if (userId) {
    query = query.eq("user_id", userId);
  }
  if (modelId) {
    query = query.eq("model_id", modelId);
  }
  if (asOf) {
    query = query.lte("created_at", asOf);
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    const pattern = `%${trimmedSearch.replace(/[%_",]/g, "")}%`;
    query = query.or(`name.ilike."${pattern}",description.ilike."${pattern}"`);
  }

  if (sort === "liked") {
    query = query
      .order("vote_score", { ascending: false })
      .order("vote_up_count", { ascending: false })
      .order("vote_down_count", { ascending: true })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  } else if (sort === "disliked") {
    query = query
      .order("vote_score", { ascending: true })
      .order("vote_down_count", { ascending: false })
      .order("vote_up_count", { ascending: true })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  } else {
    query = query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  }

  const { error, data: presets, count } = await query.range(from, to);

  if (presets) {
    return {
      presets: presets as unknown as Preset[],
      totalCount: count ?? presets.length,
    };
  }

  throw error ?? new Error("Failed to load presets");
};

const getPresetAuthors = async (): Promise<PresetAuthor[]> => {
  const { error, data } = await getSupabase()
    .from("presets")
    .select("user_id, user: user_id ( id, username )");

  if (!data) {
    throw error ?? new Error("Failed to load preset authors");
  }

  const byId = new Map<string, PresetAuthor>();

  for (const row of data) {
    if (!row.user_id || byId.has(row.user_id)) continue;

    const profile = Array.isArray(row.user) ? row.user[0] : row.user;

    byId.set(row.user_id, {
      id: row.user_id,
      username: profile?.username?.trim() || row.user_id,
    });
  }

  return [...byId.values()];
};

const createPreset = async (presetToInset: PresetInput) => {
  const { error, data: preset } = await getSupabase()
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

const updatePreset = async (
  presetToUpdate: PresetInput & { id: number }
) => {
  const { error, data: preset } = await getSupabase()
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
  const { error, data: preset } = await getSupabase()
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
  getPresetAuthors,
  createPreset,
  getPreset,
  deletePreset,
  updatePreset,
};
