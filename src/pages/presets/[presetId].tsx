import { useUser } from "../../hooks/useUser";
import type { GetServerSideProps, NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
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
import { Container } from "../../components/Container";
import { DeletePresetDialog } from "../../components/DeletePresetDialog";
import { Header } from "../../components/Header";
import { KnobsForm } from "../../components/KnobsForm";
import { useAppForm } from "../../hooks/form";
import { useModels } from "../../hooks/useModels";
import nextI18nextConfig from "../../../next-i18next.config";
import { presetFormOpts } from "../../hooks/presetFormOptions";
import { VoteButtons } from "../../components/VoteButtons";
import { VoteTally } from "../../components/VoteTally";
import { usePresetFormSchema } from "../../hooks/usePresetFormSchema";
import { usePreset } from "../../hooks/usePreset";
import { useUpdatePreset } from "../../hooks/useUpdatePreset";
import { useCreatePreset } from "../../hooks/useCreatePreset";
import { useMyVote } from "../../hooks/useMyVote";
import { useVotePreset } from "../../hooks/useVotePreset";
import type { VoteValue } from "../../services/voteService";
import { fieldErrorMessage } from "../../utils/fieldErrorMessage";

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

  const { data: myVote } = useMyVote(preset?.id, user?.id);
  const { vote, remove, isPending: isVoting } = useVotePreset();

  // Voting on your own preset is rejected by the preset_votes RLS policies.
  const isPresetOwner = !!preset && !!user && preset.user_id === user.id;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

      if (preset?.id) {
        await updatePreset({ id: preset.id, ...payload });
      } else {
        await createPreset(payload);
      }

      toast.success(t("submit-success-message"));
      router.replace("/account");
    },
  });

  const dialogMode =
    presetId === "new"
      ? "creating"
      : preset?.user_id === user?.id
        ? "editing"
        : "viewing";

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
      // `keepDefaultValues` is required: `reset(values)` otherwise promotes the
      // preset to the form's new `defaultValues`, and `useForm` re-applies the
      // options we hand it (`presetFormOpts`, i.e. the blank create-form values)
      // after every render, wiping the hydration on the next re-render.
      form.reset(
        {
          customIR: preset.custom_ir?.url ?? "",
          customIRDistance: preset.custom_ir?.distance ?? 0,
          description: preset.description ?? "",
          name: preset.name,
          modelId: preset.model_id,
          knobValues: preset.knobs_values ?? {},
        },
        { keepDefaultValues: true }
      );
    }
  }, [preset, models]); // eslint-disable-line react-hooks/exhaustive-deps -- reset only when preset/models load

  const showDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

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

  const handleVote = (value: VoteValue) => {
    if (!user?.id || !preset) return;

    vote(
      { presetId: preset.id, userId: user.id, value },
      {
        onSuccess: () => toast.success(t("preset-vote-saved-message")),
        onError: () => toast.error(t("preset-vote-error-message")),
      }
    );
  };

  const handleClearVote = () => {
    if (!preset) return;

    remove(preset.id, {
      onSuccess: () => toast.success(t("preset-vote-removed-message")),
      onError: () => toast.error(t("preset-vote-error-message")),
    });
  };

  return (
    <>
      <Head>
        <title>{`Cube Baby Presets - ${title}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_0%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_60%_40%_at_95%_30%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_50%)]" />
        <div className="absolute -top-32 right-[-12%] size-[min(36rem,85vw)] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <Header />

      <main className="relative flex w-full flex-1 flex-col items-center overflow-hidden">
        <Container className="relative z-10 my-10 w-full py-4 md:my-14 md:py-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
            className="animate-in fade-in slide-in-from-bottom-3 flex w-full flex-col fill-mode-both gap-10 duration-700 ease-out motion-reduce:animate-none"
          >
            {dialogMode !== "creating" && !preset ? (
              <div className="flex w-full flex-col items-center justify-center py-24">
                <Spinner className="size-8" />
              </div>
            ) : (
              <>
                <h1 className="font-heading max-w-[18ch] text-4xl leading-[1.05] font-bold tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
                  {title}
                </h1>

                {preset ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <p className="text-sm font-semibold">
                        {t("preset-vote-title")}
                      </p>
                      <VoteTally
                        upCount={preset.vote_up_count}
                        downCount={preset.vote_down_count}
                      />
                    </div>
                    {isPresetOwner ? (
                      <p className="text-sm text-muted-foreground">
                        {t("preset-vote-own-preset-hint")}
                      </p>
                    ) : user ? (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <p className="text-sm text-muted-foreground">
                          {t("preset-vote-your-vote")}
                        </p>
                        <VoteButtons
                          value={myVote?.value ?? 0}
                          upCount={preset.vote_up_count}
                          downCount={preset.vote_down_count}
                          onVote={handleVote}
                          onClear={handleClearVote}
                          disabled={isVoting}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t("preset-vote-signin-hint")}{" "}
                        <Link
                          href="/signin"
                          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                        >
                          {t("preset-vote-signin-link")}
                        </Link>
                      </p>
                    )}
                  </div>
                ) : null}

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
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            aria-invalid={!!error}
                            disabled={dialogMode === "viewing"}
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
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            aria-invalid={!!error}
                            disabled={dialogMode === "viewing"}
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
                                    disabled={dialogMode === "viewing"}
                                  />
                                  {error ? (
                                    <FieldError>{error}</FieldError>
                                  ) : null}
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
                                    disabled={dialogMode === "viewing"}
                                  />
                                  {error ? (
                                    <FieldError>{error}</FieldError>
                                  ) : null}
                                </Field>
                              );
                            }}
                          </form.Field>
                        </div>

                        <form.Subscribe
                          selector={(state) => state.values.customIR}
                        >
                          {(customIR) => (
                            <KnobsForm
                              form={form}
                              model={selectedModel}
                              disabled={dialogMode === "viewing"}
                              disableIR={!!customIR}
                            />
                          )}
                        </form.Subscribe>

                        {(dialogMode === "creating" ||
                          dialogMode === "editing") && (
                          <div className="flex flex-col-reverse gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
                            {dialogMode === "editing" ? (
                              <Button
                                type="button"
                                variant="destructive"
                                size="lg"
                                onClick={showDeleteDialog}
                                className="h-11 w-full sm:w-auto sm:min-w-32"
                              >
                                {t("preset-delete-button")}
                              </Button>
                            ) : (
                              <span className="hidden sm:block" />
                            )}
                            <form.Subscribe
                              selector={(state) => state.isSubmitting}
                            >
                              {(isSubmitting) => (
                                <Button
                                  type="submit"
                                  size="lg"
                                  className="h-11 w-full px-8 text-base sm:w-auto sm:min-w-40"
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <Spinner />
                                  ) : dialogMode === "creating" ? (
                                    t("preset-submit-button", {
                                      context: "creating",
                                    })
                                  ) : (
                                    t("preset-submit-button", {
                                      context: "editing",
                                    })
                                  )}
                                </Button>
                              )}
                            </form.Subscribe>
                          </div>
                        )}
                      </div>
                    );
                  }}
                </form.Subscribe>
              </>
            )}
          </form>

          <DeletePresetDialog
            presetId={preset?.id ?? 0}
            open={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
          />
        </Container>
      </main>
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
