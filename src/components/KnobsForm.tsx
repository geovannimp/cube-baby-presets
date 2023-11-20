import clsx from "clsx";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { usePresetFormSchema } from "../hooks/usePresetFormSchema";
import { Model } from "../services/modelService";
import { Card } from "./Card";
import { Pedal } from "./Pedal";

interface KnobsFormProps {
  model: Model;
  disabled?: boolean;
  disableIR?: boolean;
}

export const KnobsForm = ({
  model,
  disabled = false,
  disableIR,
}: KnobsFormProps) => {
  const schema = usePresetFormSchema();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<z.infer<typeof schema>>();

  const knobValues = watch("knobValues");
  const onChange = (newValues: Record<string, number>) => {
    setValue("knobValues", newValues);
  };

  return knobValues ? (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center">
        <Pedal
          model={model}
          knobValues={knobValues}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <Card className="w-full">
        {Object.entries(model.knobs).map(([knobName, [minValue, maxValue]]) => (
          <fieldset
            className={clsx(
              "flex flex-row p-2 gap-4 items-center flex-wrap",
              knobName === "ir_cab" && disableIR && "opacity-30"
            )}
            key={`field-${model.id}-field-${knobName}`}
          >
            <h6 className="w-16 text-xs font-bold">
              {knobName.replace("_", " ").toUpperCase()}
            </h6>

            <Controller
              render={({ field: { onChange, ...field } }) => (
                <input
                  className="flex-1 h-1 bg-gray-200 rounded appearance-none cursor-pointer dark:bg-gray-700"
                  type="range"
                  {...field}
                  onChange={(e) => onChange(Number(e.target.value))}
                  min={minValue}
                  max={maxValue}
                  step={1}
                  disabled={disabled || (knobName === "ir_cab" && disableIR)}
                />
              )}
              name={`knobValues.${knobName}`}
              control={control}
            />

            <Controller
              render={({ field: { onChange, ...field } }) => (
                <input
                  className="w-16 bg-gray-100 text-gray-800 border border-gray-500 text-center rounded p-0"
                  type="number"
                  {...field}
                  onChange={(e) => onChange(Number(e.target.value))}
                  min={minValue}
                  max={maxValue}
                  disabled={disabled || (knobName === "ir_cab" && disableIR)}
                />
              )}
              name={`knobValues.${knobName}`}
              control={control}
            />
            {errors.knobValues?.[knobName] && (
              <p className="w-full basis-full text-xs font-bold text-red-500">
                {errors.knobValues?.[knobName]?.message}
              </p>
            )}
          </fieldset>
        ))}
      </Card>
    </div>
  ) : (
    <></>
  );
};
