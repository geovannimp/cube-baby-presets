import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetPresetsOptions, PresetService } from "../services/presetService";

export const usePresets = (
  options?: GetPresetsOptions,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: [
      "presets",
      options?.userId,
      options?.modelId,
      options?.search,
      options?.page,
      options?.pageSize,
      options?.asOf,
      options?.sort,
      options?.likedByUserId,
    ],
    queryFn: async () => PresetService.getPresets(options),
    enabled,
    // Keep the previous page on screen (behind the skeleton) so the
    // pagination totals stay visible while the next page loads.
    placeholderData: keepPreviousData,
  });
};
