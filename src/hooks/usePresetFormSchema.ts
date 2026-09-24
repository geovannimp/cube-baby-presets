import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { z } from "zod";
import { Model, ModelId } from "../services/modelService";

export const usePresetFormSchema = (models?: Model[]) => {
  const { t } = useTranslation("preset");
  const modelIds = useMemo(() => models?.map((m) => m.id) ?? [], [models]);

  return useMemo(
    () =>
      z
        .object({
          name: z.string().min(1, t("name-field-required-error")),
          description: z.string().min(1, t("description-field-required-error")),
          customIR: z
            .string()
            .url(t("preset-invalid-custom-ir"))
            .or(z.literal("")),
          customIRDistance: z
            .number({ invalid_type_error: t("preset-invalid-custom-ir-distance") })
            .int()
            .min(0, t("preset-invalid-custom-ir-distance"))
            .max(100, t("preset-invalid-custom-ir-distance")),
          modelId: z
            .string()
            .min(1, t("version-field-required-error"))
            .refine((v) => modelIds.includes(v as ModelId), {
              message: t("version-field-required-error"),
            }),
          knobValues: z.record(z.string(), z.number().int()),
        })
        .superRefine(({ modelId, knobValues }, ctx) => {
          const model = models?.find((m) => m.id === modelId);
          if (!model) return;

          for (const knob of Object.keys(knobValues)) {
            const range = model.knobs[knob];
            if (!range) continue;
            const [knobMin, knobMax] = range;
            const value = knobValues[knob];
            if (value < knobMin || value > knobMax) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["knobValues", knob],
                message: t("knob-field-out-of-range", {
                  knob: knob.replace("_", " ").toUpperCase(),
                  knobMin,
                  knobMax,
                }),
              });
            }
          }
        }),
    [modelIds, models, t]
  );
};
