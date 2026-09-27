import { useQuery } from "@tanstack/react-query";
import { Model, ModelService } from "../services/modelService";

export const useModels = () => {
  return useQuery({
    queryKey: ["models"],
    queryFn: async () => ModelService.getModels(),
  });
};
