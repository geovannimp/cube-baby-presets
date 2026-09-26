import clsx from "clsx";
import { useTranslation } from "next-i18next";

import { withForm } from "../hooks/form";
import { presetFormOpts } from "../hooks/presetFormOptions";
import type { Model } from "../services/modelService";
import { fieldErrorMessage } from "../utils/fieldErrorMessage";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { KnobsPanel } from "./KnobsPanel";

export const KnobsForm = withForm({
  ...presetFormOpts,
  props: {
    model: undefined! as Model,
  } as {
    model: Model;
    /** Greys out the cab knob when a custom IR replaces it. */
    disableIR?: boolean;
  },
  render: function Render({ form, model, disableIR }) {
    const { t } = useTranslation();

    return (
      <form.Subscribe selector={(state) => state.values.knobValues}>
        {(knobValues) =>
          knobValues ? (
            <KnobsPanel
              model={model}
              knobValues={knobValues}
              onChange={(newValues) => {
                form.setFieldValue("knobValues", newValues);
              }}
              title={t("knob-values-title")}
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  {Object.entries(model.knobs).map(
                    ([knobName, [minValue, maxValue]]) => (
                      <form.Field
                        key={`field-${model.id}-field-${knobName}`}
                        name={`knobValues.${knobName}`}
                      >
                        {(field) => {
                          const error = fieldErrorMessage(
                            field.state.meta.errors
                          );
                          const isDisabled =
                            knobName === "ir_cab" && disableIR;
                          const label = knobName.replaceAll("_", " ");
                          const value =
                            typeof field.state.value === "number"
                              ? field.state.value
                              : minValue;

                          return (
                            <fieldset
                              className={clsx(
                                // Same block treatment as the details page values.
                                "grid grid-cols-[4.75rem_minmax(0,1fr)_2.75rem] items-center gap-x-3 gap-y-1 rounded-lg bg-muted/50 px-3.5 py-2.5",
                                knobName === "ir_cab" &&
                                  disableIR &&
                                  "opacity-40"
                              )}
                            >
                              <label
                                htmlFor={field.name}
                                className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase"
                              >
                                {label}
                              </label>
                              <Slider
                                id={field.name}
                                // The default `bg-muted` track washes out on the
                                // muted block, so lift it to the border colour.
                                className="min-w-0 [&_[data-slot=slider-track]]:bg-border"
                                value={[value]}
                                min={minValue}
                                max={maxValue}
                                step={1}
                                disabled={isDisabled}
                                aria-label={label}
                                onValueChange={(next) => {
                                  const selected = Array.isArray(next)
                                    ? next[0]
                                    : next;
                                  field.handleChange(selected ?? minValue);
                                }}
                                onValueCommitted={() => field.handleBlur()}
                              />
                              <Input
                                className="h-8 w-11 justify-self-end px-0.5 text-center text-xs tabular-nums"
                                type="number"
                                name={`${field.name}-number`}
                                value={value}
                                onBlur={field.handleBlur}
                                onChange={(event) =>
                                  field.handleChange(
                                    Number(event.target.value)
                                  )
                                }
                                min={minValue}
                                max={maxValue}
                                disabled={isDisabled}
                                aria-invalid={!!error}
                                aria-label={`${label} value`}
                              />
                              {error ? (
                                <p className="col-span-3 text-xs font-medium text-destructive">
                                  {error}
                                </p>
                              ) : null}
                            </fieldset>
                          );
                        }}
                      </form.Field>
                    )
                  )}
                </div>
            </KnobsPanel>
          ) : null
        }
      </form.Subscribe>
    );
  },
});
