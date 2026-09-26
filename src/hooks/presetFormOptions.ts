import { formOptions } from "@tanstack/react-form";

import type { PresetFormValues } from "../types/presetForm";

export const presetFormOpts = formOptions({
  defaultValues: {
    name: "",
    description: "",
    customIR: "",
    customIRDistance: 0,
    modelId: "",
    knobValues: {},
  } satisfies PresetFormValues,
});
