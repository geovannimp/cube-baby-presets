import clsx from "clsx";
import { Model } from "../services/modelService";
import { PresetKnobsValueMap } from "../services/presetService";
import { Card } from "./Card";
import { Pedal } from "./Pedal";

interface KnobsFormProps {
  model: Model;
  knobValues: PresetKnobsValueMap;
  onChange: (newValue: PresetKnobsValueMap) => void;
  disabled?: boolean;
  disableIR?: boolean;
}

export const KnobsForm = ({
  model,
  knobValues,
  onChange,
  disabled = false,
  disableIR,
}: KnobsFormProps) => {
  const handleChange =
    (knobName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...knobValues,
        [knobName]: Number(event.target.value),
      });
    };

  return (
    <form className="flex flex-col gap-8">
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
              "flex flex-row p-2 gap-4 items-center",
              knobName === "ir_cab" && disableIR && "opacity-30"
            )}
            key={`field-${model.id}-field-${knobName}`}
          >
            <h6 className="w-16 text-xs font-bold">
              {knobName.replace("_", " ").toUpperCase()}
            </h6>
            <input
              className="flex-1 h-1 bg-gray-200 rounded appearance-none cursor-pointer dark:bg-gray-700"
              type="range"
              value={knobValues[knobName]}
              min={minValue}
              max={maxValue}
              onChange={handleChange(knobName)}
              step={1}
              disabled={disabled || (knobName === "ir_cab" && disableIR)}
            />
            <input
              className="w-16 bg-gray-100 text-gray-800 border border-gray-500 text-center rounded p-0"
              type="number"
              value={knobValues[knobName]}
              onChange={handleChange(knobName)}
              min={minValue}
              max={maxValue}
              disabled={disabled || (knobName === "ir_cab" && disableIR)}
            />
          </fieldset>
        ))}
      </Card>
    </form>
  );
};
