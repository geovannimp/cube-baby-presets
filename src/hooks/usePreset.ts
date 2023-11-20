import { useQuery } from "@tanstack/react-query";
import { PresetService } from "../services/presetService";

export const usePreset = (presetId?: number) => {
  return useQuery(
    ["presets", presetId],
    async () => (presetId ? PresetService.getPreset(presetId) : undefined),
    {
      enabled: !!presetId,
    }
  );
};
