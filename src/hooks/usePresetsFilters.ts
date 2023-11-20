import { useRouter } from "next/router";
import { shake } from "radash";
import { useState } from "react";
import { set } from "zod";

interface Filter {
  search: string;
  modelId: string;
  userId: string;
}

export const usePresetsFilters = () => {
  const router = useRouter();

  const [filter, setFilter] = useState<Filter>({
    search: router.query.search?.toString() ?? "",
    modelId: router.query.modelId?.toString() ?? "all",
    userId: router.query.userId?.toString() ?? "all",
  });

  const setFilterWithQueryParam = (callback: (oldValue: Filter) => Filter) => {
    setFilter((currentValue) => {
      const newValue = callback(currentValue);
      router.replace({
        query: shake(newValue, (value) => !value || value === "all"),
      });
      return newValue;
    });
  };

  return {
    filter,
    setFilter: setFilterWithQueryParam,
  };
};
