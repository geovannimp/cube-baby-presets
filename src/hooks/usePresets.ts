import { useQuery } from "@tanstack/react-query";
import { GetPresetsOptions, PresetService } from "../services/presetService";

export const usePresets = (options?: GetPresetsOptions) => {
  return useQuery(["presets", options?.userId], async () =>
    PresetService.getPresets(options)
  );
};
