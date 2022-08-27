import { useMutation } from "@tanstack/react-query";
import { Preset, PresetService } from "../services/presetService";
import { queryClient } from "../utils/queryClient";

export const useUpdatePreset = () => {
  return useMutation(PresetService.updatePreset, {
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["presets"],
        (currentData?: Preset[]) =>
          currentData?.map((preset) =>
            preset.id === data.id ? data : preset
          ) ?? []
      );
      queryClient.setQueryData(["preset", data.id], data);
    },
  });
};
