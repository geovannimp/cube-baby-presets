import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { z } from "zod";
import { Model, ModelId } from "../services/modelService";

export const usePresetFormSchema = (models?: Model[]) => {
  const { t } = useTranslation("preset");
  const modelIds = useMemo(() => models?.map((m) => m.id) ?? [], [models]);

  return z
    .object({
      name: z.string().min(1, t("name-field-required-error")),
      description: z.string().min(1, t("description-field-required-error")),
      customIR: z
        .string()
        .url(t("preset-invalid-custom-ir"))
        .optional()
        .or(z.literal("")),
      customIRDistance: z
        .number()
        .int()
        .min(0, t("preset-invalid-custom-ir-distance"))
        .max(100, t("preset-invalid-custom-ir-distance")),
      modelId: z.string().refine((v) => modelIds.includes(v as ModelId)),
      knobValues: z.record(z.string(), z.number().int()),
    })
    .required()
    .superRefine(({ modelId, knobValues }, ctx) => {
      const allKnobs = Object.keys(knobValues);
      const model = models?.find((m) => m.id === modelId);
      if (model) {
        for (const knob of allKnobs) {
          const [knobMin, knobMax] = model.knobs[knob];
          if (knobValues[knob] < knobMin || knobValues[knob] > knobMax) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [`knobValues.${knob}`],
              message: t("knob-field-out-of-range", {
                knob: knob.replace("_", " ").toUpperCase(),
                knobMin,
                knobMax,
              }),
            });
          }
        }
      }
    });
};
