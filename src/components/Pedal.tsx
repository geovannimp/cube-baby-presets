import { Model } from "../services/modelService";
import { PresetKnobsValueMap } from "../services/presetService";
import { Knob } from "./Knob";

const KNOBS_WITH_TICK = ["ir_cab", "type"];

interface PedalProps {
  model: Model;
  knobValues: PresetKnobsValueMap;
  onChange: (newValue: PresetKnobsValueMap) => void;
  disabled?: boolean;
}

export const Pedal = ({
  model,
  knobValues,
  onChange,
  disabled = false,
}: PedalProps) => {
  return (
    <div
      className="flex flex-col basis-auto overflow-auto border box-content border-gray-700 rounded bg-neutral-900"
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
                <h6 className="text-xs font-bold">
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
