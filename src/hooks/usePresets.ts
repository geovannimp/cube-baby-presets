import { useEffect, useState } from "react";
import {
  GetPresetsOptions,
  Preset,
  PresetService,
} from "../services/presetService";

export const usePresets = (options?: GetPresetsOptions) => {
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState<Preset[]>();

  useEffect(() => {
    setLoading(true);
    PresetService.getPresets(options)
      .then(setPresets)
      .finally(() => setLoading(false));
  }, [options]);

  return {
    presets,
    loading,
  };
};
