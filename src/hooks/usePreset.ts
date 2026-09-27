import { useQuery } from "@tanstack/react-query";
import { PresetService } from "../services/presetService";

export const usePreset = (presetId?: number) => {
  return useQuery({
    queryKey: ["presets", presetId],
    queryFn: async () =>
      presetId ? PresetService.getPreset(presetId) : undefined,
    enabled: !!presetId,
  });
};
