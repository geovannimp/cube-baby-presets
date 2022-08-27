import { useMutation } from "@tanstack/react-query";
import { Preset, PresetService } from "../services/presetService";
import { queryClient } from "../utils/queryClient";

export const useCreatePreset = () => {
  return useMutation(PresetService.createPreset, {
    onSuccess: (data) => {
      queryClient.setQueryData(["presets"], (currentData?: Preset[]) => [
        ...(currentData ?? []),
        data,
      ]);
      queryClient.setQueryData(["preset", data.id], data);
    },
  });
};
