import clsx from "clsx";
import { useMemo } from "react";
import { Model } from "../services/modelService";
import { Knob } from "./Knob";

const KNOBS_WITH_TICK = ["ir_cab", "type"];

interface PedalProps {
  model: Model;
  knobValues: Record<string, number>;
  onChange: (newValue: Record<string, number>) => void;
  disabled?: boolean;
}

export const Pedal = ({
  model,
  knobValues,
  onChange,
  disabled = false,
}: PedalProps) => {
  const colors = useMemo(() => {
    switch (model.id) {
      case "cube-baby":
        return {
          background: "bg-neutral-900",
          border: "border-gray-700",
          text: "text-gray-100",
        };
      case "cube-baby-ac":
        return {
          background: "bg-amber-200",
          border: "border-amber-900",
          text: "text-gray-900",
        };
      case "cube-baby-bass":
        return {
          background: "bg-sky-900",
          border: "border-sky-700",
          text: "text-gray-100",
        };
    }
  }, [model.id]);

  return (
    <div
      className={clsx(
        `flex flex-col basis-auto overflow-auto border box-content rounded`,
        colors.background,
        colors.border
      )}
      style={{ maxWidth: 680 }}
    >
      <div className="px-8" style={{ width: 680 }}>
        <div className="flex basis-auto p-4 gap-2 justify-between">
          {Object.entries(model.knobs).map(
            ([knobName, [minValue, maxValue]]) => (
              <div
                className="flex flex-col items-center"
                key={`knob-${model.id}-field-${knobName}`}
                style={knobName === "volume" ? { marginRight: 32 } : undefined}
              >
                <Knob
                  size={45}
                  numTicks={
                    KNOBS_WITH_TICK.includes(knobName) ? maxValue : undefined
                  }
                  degrees={260}
                  min={minValue}
                  max={maxValue}
                  value={knobValues[knobName] ?? 0}
                  onChange={(newValue) =>
                    onChange({ ...knobValues, [knobName]: newValue })
                  }
                  disabled={disabled}
                />
                <h6
                  className={clsx(
                    "text-xs font-bold text-gray-100",
                    colors.text
                  )}
                >
                  {knobName.replace("_", " ").toUpperCase()}
                </h6>
              </div>
            )
          )}
        </div>
        <div className="flex pt-8 pb-4 justify-between">
          <div className="w-12 h-12 rounded-full bg-neutral-400" />
          <div className="w-12 h-12 rounded-full bg-neutral-400" />
          <div className="w-12 h-12 rounded-full bg-neutral-400" />
        </div>
      </div>
    </div>
  );
};
