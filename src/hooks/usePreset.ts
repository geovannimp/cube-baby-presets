import { useEffect, useState } from "react";
import { Preset, PresetService } from "../services/presetService";

export const usePreset = (presetId?: number) => {
  const [loading, setLoading] = useState(false);
  const [preset, setPreset] = useState<Preset>();

  useEffect(() => {
    if (presetId) {
      setLoading(true);
      PresetService.getPreset(presetId)
        .then(setPreset)
        .finally(() => setLoading(false));
    }
  }, [presetId]);

  return {
    preset,
    loading,
  };
};
