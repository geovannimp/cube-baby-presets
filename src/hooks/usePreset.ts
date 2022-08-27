import { useQuery } from "@tanstack/react-query";
import { Preset, PresetService } from "../services/presetService";

export const usePreset = (presetId?: number) => {
  return useQuery(
    ["posts", presetId],
    async () => (presetId ? PresetService.getPreset(presetId) : undefined),
    {
      enabled: !!presetId,
    }
  );
};
