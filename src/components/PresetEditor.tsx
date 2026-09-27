import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { DeletePresetDialog } from "./DeletePresetDialog";
import { KnobsForm } from "./KnobsForm";
import { useAppForm } from "../hooks/form";
import { useModels } from "../hooks/useModels";
import { presetFormOpts } from "../hooks/presetFormOptions";
import { usePresetFormSchema } from "../hooks/usePresetFormSchema";
import { useCreatePreset } from "../hooks/useCreatePreset";
import { useUpdatePreset } from "../hooks/useUpdatePreset";
import { useUser } from "../hooks/useUser";
import { fieldErrorMessage } from "../utils/fieldErrorMessage";
import type { Preset } from "../services/presetService";

type PresetEditorProps = {
  /** Set when editing an existing preset, omitted when creating a new one. */
  preset?: Preset;
};

/**
 * Form used by the create and edit pages. Viewing a preset is the read-only
 * details page, so every control here is always editable.
 */
export const PresetEditor = ({ preset }: PresetEditorProps) => {
  const { t } = useTranslation("preset");
  const { user } = useUser();
  const router = useRouter();
  const { data: models } = useModels();
  const { mutateAsync: createPreset } = useCreatePreset();
  const { mutateAsync: updatePreset } = useUpdatePreset();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const mode = preset ? "editing" : "creating";

  const schema = usePresetFormSchema(models);

  const form = useAppForm({
    ...presetFormOpts,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      if (!user?.id || !value.modelId) return;

      const payload = {
        name: value.name,
        knobs_values: value.knobValues,
        model_id: value.modelId,
        published: false,
        user_id: user.id,
        description: value.description,
        custom_ir: value.customIR
          ? {
              url: value.customIR,
              distance: value.customIRDistance,
            }
          : undefined,
      };

      if (preset) {
        await updatePreset({ id: preset.id, ...payload });
        toast.success(t("submit-success-message"));
        router.replace(`/presets/${preset.id}`);
        return;
      }

      await createPreset(payload);
      toast.success(t("submit-success-message"));
      router.replace(`/profile/${user.id}`);
    },
  });

  const modelSelectItems = useMemo(
    () =>
      models?.map((model) => ({
        value: model.id,
        label: model.name,
      })) ?? [],
    [models]
  );

  useEffect(() => {
    if (preset && models) {
      form.reset({
        customIR: preset.custom_ir?.url ?? "",
        customIRDistance: preset.custom_ir?.distance ?? 0,
        description: preset.description ?? "",
        name: preset.name,
        modelId: preset.model_id,
        knobValues: preset.knobs_values ?? {},
      });
    }
  }, [preset, models]); // eslint-disable-line react-hooks/exhaustive-deps -- reset only when preset/models load

  const resetKnobValuesForModel = (modelId: string) => {
    const model = models?.find((item) => item.id === modelId);
    if (!model) return;

    form.setFieldValue(
      "knobValues",
      Object.keys(model.knobs).reduce<Record<string, number>>(
        (obj, knobName) => ({ ...obj, [knobName]: 0 }),
        {}
      )
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 flex w-full flex-col gap-10 fill-mode-both duration-700 ease-out motion-reduce:animate-none">
      <h1 className="font-heading max-w-[18ch] text-4xl leading-[1.05] font-bold tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
        {t("preset-title", { context: mode })}
      </h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex w-full flex-col gap-10"
      >
        <FieldGroup className="gap-6">
          <form.Field name="name">
            {(field) => {
              const error = fieldErrorMessage(field.state.meta.errors);
              return (
                <Field data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor={field.name}>{`${t("name-field")} *`}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={!!error}
                  />
                  {error ? <FieldError>{error}</FieldError> : null}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="description">
            {(field) => {
              const error = fieldErrorMessage(field.state.meta.errors);
              return (
                <Field data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor={field.name}>
                    {`${t("description-field")} *`}
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={!!error}
                  />
                  {error ? <FieldError>{error}</FieldError> : null}
                </Field>
              );
            }}
          </form.Field>
          {models ? (
            <form.Field name="modelId">
              {(field) => {
                const error = fieldErrorMessage(field.state.meta.errors);
                return (
                  <Field data-invalid={error ? true : undefined}>
                    <FieldLabel>{`${t("version-field")} *`}</FieldLabel>
                    <Select
                      items={modelSelectItems}
                      value={field.state.value || null}
                      onValueChange={(value) => {
                        if (value == null) return;
                        field.handleChange(value);
                        resetKnobValuesForModel(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {error ? <FieldError>{error}</FieldError> : null}
                  </Field>
                );
              }}
            </form.Field>
          ) : (
            <div className="flex justify-center py-4">
              <Spinner className="size-8" />
            </div>
          )}
        </FieldGroup>

        <form.Subscribe selector={(state) => state.values.modelId}>
          {(selectedModelId) => {
            const selectedModel = models?.find(
              (model) => model.id === selectedModelId
            );
            if (!selectedModel) return null;

            return (
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <form.Field name="customIR">
                    {(field) => {
                      const error = fieldErrorMessage(
                        field.state.meta.errors
                      );
                      return (
                        <Field
                          className="w-full"
                          data-invalid={error ? true : undefined}
                        >
                          <FieldLabel htmlFor={field.name}>
                            {t("custom-ir-field")}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="https://"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            aria-invalid={!!error}
                          />
                          {error ? <FieldError>{error}</FieldError> : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                  <form.Field name="customIRDistance">
                    {(field) => {
                      const error = fieldErrorMessage(
                        field.state.meta.errors
                      );
                      return (
                        <Field
                          className="w-full sm:w-32"
                          data-invalid={error ? true : undefined}
                        >
                          <FieldLabel htmlFor={field.name}>
                            {t("custom-ir-distance-field")}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="number"
                            value={
                              Number.isNaN(field.state.value)
                                ? ""
                                : field.state.value
                            }
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(
                                event.target.value === ""
                                  ? Number.NaN
                                  : event.target.valueAsNumber
                              )
                            }
                            aria-invalid={!!error}
                          />
                          {error ? <FieldError>{error}</FieldError> : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                </div>

                <form.Subscribe selector={(state) => state.values.customIR}>
                  {(customIR) => (
                    <KnobsForm
                      form={form}
                      model={selectedModel}
                      disableIR={!!customIR}
                    />
                  )}
                </form.Subscribe>

                <div className="flex flex-col-reverse gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
                  {preset ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="lg"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="h-11 w-full sm:w-auto sm:min-w-32"
                    >
                      {t("preset-delete-button")}
                    </Button>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                  <form.Subscribe selector={(state) => state.isSubmitting}>
                    {(isSubmitting) => (
                      <Button
                        type="submit"
                        size="lg"
                        className="h-11 w-full px-8 text-base sm:w-auto sm:min-w-40"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Spinner />
                        ) : (
                          <>{t("preset-submit-button", { context: mode })}</>
                        )}
                      </Button>
                    )}
                  </form.Subscribe>
                </div>
              </div>
            );
          }}
        </form.Subscribe>
      </form>

      {preset ? (
        <DeletePresetDialog
          presetId={preset.id}
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      ) : null}
    </div>
  );
};
