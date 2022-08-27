import { useUser } from "@supabase/supabase-auth-helpers/react";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { DeletePresetDialog } from "../../components/DeletePresetDialog";
import { Header } from "../../components/Header";
import { Input } from "../../components/Input";
import { KnobsForm } from "../../components/KnobsForm";
import LoadingDots from "../../components/LoadingDots";
import { Select } from "../../components/Select";
import { Textarea } from "../../components/Textarea";
import { useModels } from "../../hooks/useModels";
import { usePreset } from "../../hooks/usePreset";
import { Model, ModelId } from "../../services/modelService";
import { PresetService } from "../../services/presetService";
import nextI18nextConfig from "../../../next-i18next.config";
import { usePresetFormSchema } from "../../hooks/usePresetFormSchema";

const NewPreset: NextPage = () => {
  const { t } = useTranslation("preset");
  const { user } = useUser();
  const router = useRouter();
  const { presetId } = router.query;

  const { models } = useModels();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const { preset } = usePreset(
    presetId && presetId !== "new" ? Number(presetId) : undefined
  );

  const modelIds = useMemo(() => models?.map((m) => m.id) ?? [], [models]);
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
    formState: { errors, isValid, isSubmitting },
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
          await PresetService.updatePreset({
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
          await PresetService.createPreset({
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
        toast.success(t("submit-success-message"), {
          position: "bottom-center",
          style: {
            marginBottom: 50,
          },
        });
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
    if (selectedModel) {
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
  }, [selectedModel, setValue]);

  return (
    <>
      <Head>
        <title>{`Cube Baby Presets - ${title}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <Container className="my-8">
        <FormProvider {...formMethods}>
          <form onSubmit={onSubmit} className="flex gap-4 flex-col w-full">
            {dialogMode !== "creating" && !preset ? (
              <div className="flex flex-col justify-center items-center w-full">
                <LoadingDots />
              </div>
            ) : (
              <>
                <p className="font-bold text-2xl">{title}</p>
                <Input
                  label={`${t("name-field")} *`}
                  {...register("name")}
                  helperText={errors.name?.message}
                  error={!!errors.name}
                  disabled={dialogMode === "viewing"}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      label={`${t("description-field")} *`}
                      {...field}
                      helperText={errors.description?.message}
                      error={!!errors.description}
                      disabled={dialogMode === "viewing"}
                    />
                  )}
                />
                {models ? (
                  <Controller
                    name="modelId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label={`${t("version-field")} *`}
                        {...field}
                        disabled={dialogMode === "viewing"}
                        extractLabel={(modelId) =>
                          models.find((m) => m.id === modelId)?.name ?? ""
                        }
                        options={modelIds}
                      />
                    )}
                  />
                ) : (
                  <LoadingDots />
                )}
                {selectedModel && (
                  <>
                    <div className="flex flex-row gap-4">
                      <Input
                        containerClassName="w-full"
                        label={`${t("custom-ir-field")}`}
                        {...register("customIR")}
                        helperText={errors.customIR?.message}
                        error={!!errors.customIR}
                        placeholder="https://"
                        disabled={dialogMode === "viewing"}
                      />
                      <Input
                        containerClassName="w-32"
                        label={`${t("custom-ir-distance-field")}`}
                        type={"number"}
                        {...register("customIRDistance", {
                          valueAsNumber: true,
                        })}
                        helperText={errors.customIRDistance?.message}
                        error={!!errors.customIRDistance}
                        disabled={dialogMode === "viewing"}
                      />
                    </div>
                    <KnobsForm
                      model={selectedModel}
                      disabled={dialogMode === "viewing"}
                      disableIR={isUsingCustomIR}
                    />
                    {(dialogMode === "creating" ||
                      dialogMode === "editing") && (
                      <div className="flex flex-col my-4 mb-8 justify-between sm:flex-row-reverse">
                        <Button
                          type="submit"
                          className="w-full mb-4 sm:w-32 sm:mb-0"
                          disabled={!isValid}
                        >
                          {isSubmitting ? (
                            <LoadingDots />
                          ) : dialogMode === "creating" ? (
                            t("preset-submit-button", { context: "creating" })
                          ) : (
                            t("preset-submit-button", { context: "editing" })
                          )}
                        </Button>
                        {dialogMode === "editing" && (
                          <Button
                            onClick={showDeleteDialog}
                            className="w-full sm:w-32 bg-red-700 hover:bg-red-500"
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

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(
    locale!,
    ["common", "preset"],
    nextI18nextConfig
  ),
});

export default NewPreset;
