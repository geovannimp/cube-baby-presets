import { useMutation } from "@tanstack/react-query";
import { Preset, PresetService } from "../services/presetService";
import { queryClient } from "../utils/queryClient";

export const useDeletePreset = () => {
  return useMutation(PresetService.deletePreset, {
    onSuccess: (data, preserId) => {
      queryClient.setQueryData(
        ["presets"],
        (currentData?: Preset[]) =>
          currentData?.filter((preset) => preset.id !== preserId) ?? []
      );
      queryClient.setQueryData(["preset", preserId], undefined);
    },
  });
};
