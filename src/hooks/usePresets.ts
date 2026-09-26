import { useQuery } from "@tanstack/react-query";
import { GetPresetsOptions, PresetService } from "../services/presetService";

export const usePresets = (
  options?: GetPresetsOptions,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  return useQuery(
    [
      "presets",
      options?.userId,
      options?.modelId,
      options?.search,
      options?.page,
      options?.pageSize,
      options?.asOf,
      options?.sort,
    ],
    async () => PresetService.getPresets(options),
    { enabled }
  );
};
