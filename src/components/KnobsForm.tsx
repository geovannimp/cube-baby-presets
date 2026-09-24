import clsx from "clsx";

import { withForm } from "../hooks/form";
import { presetFormOpts } from "../hooks/presetFormOptions";
import type { Model } from "../services/modelService";
import { fieldErrorMessage } from "../utils/fieldErrorMessage";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Pedal } from "./Pedal";

export const KnobsForm = withForm({
  ...presetFormOpts,
  props: {
    model: undefined! as Model,
    disabled: false,
    disableIR: false as boolean | undefined,
  },
  render: function Render({ form, model, disabled = false, disableIR }) {
    return (
      <form.Subscribe selector={(state) => state.values.knobValues}>
        {(knobValues) =>
          knobValues ? (
            <Card className="w-full gap-0 overflow-hidden py-0" size="sm">
              <div className="overflow-x-auto md:px-3 md:pt-3 md:pb-3">
                <div className="flex min-w-min justify-center">
                  <Pedal
                    model={model}
                    knobValues={knobValues}
                    onChange={(newValues) => {
                      form.setFieldValue("knobValues", newValues);
                    }}
                    disabled={disabled}
                  />
                </div>
              </div>

              <Separator />

              <CardContent className="py-4">
                <div className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
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
                            disabled || (knobName === "ir_cab" && disableIR);
                          const label = knobName.replaceAll("_", " ");
                          const value =
                            typeof field.state.value === "number"
                              ? field.state.value
                              : minValue;

                          return (
                            <fieldset
                              className={clsx(
                                "grid grid-cols-[4.75rem_minmax(0,1fr)_2.75rem] items-center gap-x-3 gap-y-1",
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
                                className="min-w-0"
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
              </CardContent>
            </Card>
          ) : null
        }
      </form.Subscribe>
    );
  },
});
