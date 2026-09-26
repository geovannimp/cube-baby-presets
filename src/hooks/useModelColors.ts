import { useMemo } from "react";

import type { ModelId } from "../services/modelService";

/** Badge colors that match each pedal model, used by preset cards and details. */
export const useModelColors = (modelId: string) =>
  useMemo(() => {
    switch (modelId as ModelId) {
      case "cube-baby":
        return {
          background: "bg-neutral-900",
          text: "text-gray-100",
        };
      case "cube-baby-ac":
        return {
          background: "bg-amber-200",
          text: "text-gray-900",
        };
      case "cube-baby-bass":
        return {
          background: "bg-sky-900",
          text: "text-gray-100",
        };
      default:
        return {
          background: "bg-secondary",
          text: "text-secondary-foreground",
        };
    }
  }, [modelId]);
