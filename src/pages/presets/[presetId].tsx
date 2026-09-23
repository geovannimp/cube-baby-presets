import { useUser } from "../../hooks/useUser";
import type { GetServerSideProps, NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Container } from "../../components/Container";
import { DeletePresetDialog } from "../../components/DeletePresetDialog";
import { Header } from "../../components/Header";
import { KnobsForm } from "../../components/KnobsForm";
import { useModels } from "../../hooks/useModels";
import nextI18nextConfig from "../../../next-i18next.config";
import { usePresetFormSchema } from "../../hooks/usePresetFormSchema";
import { usePreset } from "../../hooks/usePreset";
import { useUpdatePreset } from "../../hooks/useUpdatePreset";
import { useCreatePreset } from "../../hooks/useCreatePreset";

const NewPreset: NextPage = () => {
  const { t } = useTranslation("preset");
  const { user } = useUser();
  const router = useRouter();
  const { presetId } = router.query;

  const { data: preset } = usePreset(
    presetId !== "new" ? Number(presetId) : undefined
  );
  const { data: models } = useModels();
  const { mutateAsync: createPreset } = useCreatePreset();
  const { mutateAsync: updatePreset } = useUpdatePreset();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const schema = usePresetFormSchema(models);

  const formMethods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      customIRDistance: 0,
      knobValues: {},
    },
  });

  const {
    watch,
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid, isSubmitting, dirtyFields },
  } = formMethods;

  const isUsingCustomIR = !!watch("customIR");
  const selectedModelId = watch("modelId");

  const dialogMode =
    presetId === "new"
      ? "creating"
      : preset?.user_id === user?.id
      ? "editing"
      : "viewing";

  const selectedModel = useMemo(
    () => models?.find((model) => model.id === selectedModelId),
    [models, selectedModelId]
  );

  const title = useMemo(() => {
    switch (dialogMode) {
      case "creating":
        return t("preset-title", { context: "creating" });
      case "editing":
        return t("preset-title", { context: "editing" });
      case "viewing":
        return t("preset-title", { context: "viewing" });
    }
  }, [dialogMode, t]);

  const onSubmit = handleSubmit(
    async ({
      name,
      customIRDistance,
      description,
      customIR,
      knobValues,
      modelId,
    }) => {
      if (user?.id && modelId) {
        if (preset?.id) {
          await updatePreset({
            id: preset.id,
            name,
            knobs_values: knobValues,
            model_id: modelId,
            published: false,
            user_id: user.id,
            description: description,
            custom_ir: customIR
              ? {
                  url: customIR,
                  distance: customIRDistance,
                }
              : undefined,
          });
        } else {
          await createPreset({
            name,
            knobs_values: knobValues,
            model_id: modelId,
            published: false,
            user_id: user.id,
            description: description,
            custom_ir: customIR
              ? {
                  url: customIR,
                  distance: customIRDistance,
                }
              : undefined,
          });
        }
        toast.success(t("submit-success-message"));
        router.replace("/account");
      }
    }
  );

  const showDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    if (preset && models) {
      reset({
        customIR: preset.custom_ir?.url,
        customIRDistance: preset.custom_ir?.distance,
        description: preset.description,
        name: preset.name,
        modelId: preset.model_id,
        knobValues: preset.knobs_values,
      });
    }
  }, [preset, models, reset]);

  useEffect(() => {
    if (selectedModel && dirtyFields.modelId) {
      setValue(
        "knobValues",
        Object.keys(selectedModel.knobs).reduce(
          (obj, knobName) => ({ ...obj, [knobName]: 0 }),
          {}
        ),
        {
          shouldValidate: true,
        }
      );
    }
  }, [selectedModel, setValue, dirtyFields.modelId]);

  return (
    <>
      <Head>
        <title>{`Cube Baby Presets - ${title}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <Container className="my-8">
        <FormProvider {...formMethods}>
          <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
            {dialogMode !== "creating" && !preset ? (
              <div className="flex w-full flex-col items-center justify-center">
                <Spinner className="size-8" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{title}</p>
                <FieldGroup>
                  <Field data-invalid={!!errors.name || undefined}>
                    <FieldLabel htmlFor="name">{`${t("name-field")} *`}</FieldLabel>
                    <Input
                      id="name"
                      aria-invalid={!!errors.name}
                      disabled={dialogMode === "viewing"}
                      {...register("name")}
                    />
                    {errors.name?.message && (
                      <FieldError>{errors.name.message}</FieldError>
                    )}
                  </Field>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.description || undefined}>
                        <FieldLabel htmlFor="description">{`${t("description-field")} *`}</FieldLabel>
                        <Textarea
                          id="description"
                          aria-invalid={!!errors.description}
                          disabled={dialogMode === "viewing"}
                          {...field}
                        />
                        {errors.description?.message && (
                          <FieldError>{errors.description.message}</FieldError>
                        )}
                      </Field>
                    )}
                  />
                  {models ? (
                    <Controller
                      name="modelId"
                      control={control}
                      render={({ field }) => (
                        <Field data-invalid={!!errors.modelId || undefined}>
                          <FieldLabel>{`${t("version-field")} *`}</FieldLabel>
                          <Select
                            value={field.value ?? null}
                            onValueChange={field.onChange}
                            disabled={dialogMode === "viewing"}
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
                          {errors.modelId?.message && (
                            <FieldError>{errors.modelId.message}</FieldError>
                          )}
                        </Field>
                      )}
                    />
                  ) : (
                    <div className="flex justify-center py-4">
                      <Spinner className="size-8" />
                    </div>
                  )}
                </FieldGroup>
                {selectedModel && (
                  <>
                    <div className="flex flex-row gap-4">
                      <Field
                        className="w-full"
                        data-invalid={!!errors.customIR || undefined}
                      >
                        <FieldLabel htmlFor="customIR">
                          {t("custom-ir-field")}
                        </FieldLabel>
                        <Input
                          id="customIR"
                          aria-invalid={!!errors.customIR}
                          placeholder="https://"
                          disabled={dialogMode === "viewing"}
                          {...register("customIR")}
                        />
                        {errors.customIR?.message && (
                          <FieldError>{errors.customIR.message}</FieldError>
                        )}
                      </Field>
                      <Field
                        className="w-32"
                        data-invalid={!!errors.customIRDistance || undefined}
                      >
                        <FieldLabel htmlFor="customIRDistance">
                          {t("custom-ir-distance-field")}
                        </FieldLabel>
                        <Input
                          id="customIRDistance"
                          type="number"
                          aria-invalid={!!errors.customIRDistance}
                          disabled={dialogMode === "viewing"}
                          {...register("customIRDistance", {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.customIRDistance?.message && (
                          <FieldError>
                            {errors.customIRDistance.message}
                          </FieldError>
                        )}
                      </Field>
                    </div>
                    <KnobsForm
                      model={selectedModel}
                      disabled={dialogMode === "viewing"}
                      disableIR={isUsingCustomIR}
                    />
                    {(dialogMode === "creating" ||
                      dialogMode === "editing") && (
                      <div className="my-4 mb-8 flex flex-col justify-between sm:flex-row-reverse">
                        <Button
                          type="submit"
                          className="mb-4 w-full sm:mb-0 sm:w-32"
                          disabled={!isValid}
                        >
                          {isSubmitting ? (
                            <Spinner />
                          ) : dialogMode === "creating" ? (
                            t("preset-submit-button", { context: "creating" })
                          ) : (
                            t("preset-submit-button", { context: "editing" })
                          )}
                        </Button>
                        {dialogMode === "editing" && (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={showDeleteDialog}
                            className="w-full sm:w-32"
                          >
                            {t("preset-delete-button")}
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </form>
        </FormProvider>

        <DeletePresetDialog
          presetId={preset?.id ?? 0}
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: await serverSideTranslations(
    locale!,
    ["common", "preset"],
    nextI18nextConfig
  ),
});

export default NewPreset;
