import { useEffect, useState } from "react";
import { Model, ModelService } from "../services/modelService";

export const useModels = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<Model[]>();

  useEffect(() => {
    setLoading(true);
    ModelService.getModels()
      .then(setModels)
      .finally(() => setLoading(false));
  }, []);

  return {
    models,
    loading,
  };
};
