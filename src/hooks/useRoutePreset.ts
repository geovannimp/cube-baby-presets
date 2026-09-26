import { useRouter } from "next/router";

import { usePreset } from "./usePreset";

/**
 * Loads the preset addressed by the `[presetId]` route segment.
 *
 * `router.query` is empty on the first render, so the preset counts as loading
 * until the router is ready. Ids that can never resolve (missing, zero or
 * non-numeric) report `isNotFound` instead of spinning forever, and so do
 * queries that fail because the preset does not exist.
 */
export const useRoutePreset = () => {
  const router = useRouter();
  const rawPresetId = router.query.presetId;

  const presetId =
    typeof rawPresetId === "string" && /^[1-9]\d*$/.test(rawPresetId)
      ? Number(rawPresetId)
      : undefined;

  const { data: preset, isError } = usePreset(presetId);

  return {
    preset,
    isLoading: !router.isReady || (!preset && !isError),
    isNotFound: router.isReady && (presetId === undefined || isError),
  };
};
