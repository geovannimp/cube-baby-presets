import { useTranslation } from "next-i18next";

import { withForm } from "../hooks/form";
import { presetFormOpts } from "../hooks/presetFormOptions";
import type { Model } from "../services/modelService";
import { fieldErrorMessage } from "../utils/fieldErrorMessage";
import { KnobField } from "./KnobField";
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
              {/* Same column count as the details page. */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
                {Object.entries(model.knobs).map(
                  ([knobName, [minValue, maxValue]]) => (
                    <form.Field
                      key={`field-${model.id}-field-${knobName}`}
                      name={`knobValues.${knobName}`}
                    >
                      {(field) => (
                        <KnobField
                          id={field.name}
                          label={knobName.replaceAll("_", " ")}
                          value={
                            typeof field.state.value === "number"
                              ? field.state.value
                              : minValue
                          }
                          min={minValue}
                          max={maxValue}
                          // A custom IR replaces the cab selection.
                          disabled={knobName === "ir_cab" && disableIR}
                          error={fieldErrorMessage(field.state.meta.errors)}
                          onValueChange={field.handleChange}
                          onCommit={() => field.handleBlur()}
                          onBlur={() => field.handleBlur()}
                        />
                      )}
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
