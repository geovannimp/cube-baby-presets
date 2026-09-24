import { useQuery } from "@tanstack/react-query";
import { PresetService } from "../services/presetService";

export const usePresetAuthors = () => {
  return useQuery(["preset-authors"], () => PresetService.getPresetAuthors());
};
