import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ExternalLinkIcon, PencilIcon, UserCircleIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import nextI18nextConfig from "../../../../next-i18next.config";
import { Container } from "../../../components/Container";
import { Header } from "../../../components/Header";
import { KnobField } from "../../../components/KnobField";
import { KnobsPanel } from "../../../components/KnobsPanel";
import { PresetNotFound } from "../../../components/PresetNotFound";
import { VoteButtons } from "../../../components/VoteButtons";
import { VoteTally } from "../../../components/VoteTally";
import { useModelColors } from "../../../hooks/useModelColors";
import { useModels } from "../../../hooks/useModels";
import { useMyVote } from "../../../hooks/useMyVote";
import { useRoutePreset } from "../../../hooks/useRoutePreset";
import { useUser } from "../../../hooks/useUser";
import { useVotePreset } from "../../../hooks/useVotePreset";
import type { VoteValue } from "../../../services/voteService";

const PresetDetails: NextPage = () => {
  const { t } = useTranslation("presetDetail");
  // The knobs panel is shared with the editor, so its title lives in `common`.
  const { t: tCommon } = useTranslation("common");
  const { user } = useUser();
  const { preset, isLoading, isNotFound } = useRoutePreset();
  const { data: models } = useModels();
  const { data: myVote } = useMyVote(preset?.id, user?.id);
  const { vote, remove, isPending: isVoting } = useVotePreset();

  const model = useMemo(
    () => models?.find((item) => item.id === preset?.model_id),
    [models, preset?.model_id]
  );
  const modelColors = useModelColors(preset?.model_id ?? "");

  // Voting on your own preset is rejected by the preset_votes RLS policies.
  const isPresetOwner = !!preset && !!user && preset.user_id === user.id;

  const description = preset?.description?.trim();
  const username = preset?.user?.username?.trim();
  const knobValues = preset?.knobs_values ?? {};
  const customIR = preset?.custom_ir;

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
        <title>
          {preset
            ? `Cube Baby Presets - ${preset.name}`
            : "Cube Baby Presets"}
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_0%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_60%_40%_at_95%_30%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_50%)]" />
        <div className="absolute -top-32 right-[-12%] size-[min(36rem,85vw)] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <Header />

      <main className="relative flex w-full flex-1 flex-col items-center overflow-hidden">
        <Container className="relative z-10 my-10 w-full py-4 md:my-14 md:py-6">
          {isLoading ? (
            <div className="flex w-full flex-col items-center justify-center py-24">
              <Spinner className="size-8" />
            </div>
          ) : isNotFound || !preset ? (
            <PresetNotFound />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-3 flex w-full flex-col gap-10 fill-mode-both duration-700 ease-out motion-reduce:animate-none">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 flex-col gap-4">
                  <span
                    className={cn(
                      "w-fit rounded-md px-2.5 py-1 text-sm font-semibold",
                      modelColors.background,
                      modelColors.text
                    )}
                  >
                    {model?.name ?? preset.model_id}
                  </span>

                  <h1 className="font-heading max-w-[18ch] text-4xl leading-[1.05] font-bold tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
                    {preset.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    {username ? (
                      <>
                        <Link
                          href={`/profile/${preset.user_id}`}
                          className="inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          <UserCircleIcon className="size-3.5 shrink-0" aria-hidden />
                          <span className="truncate">{username}</span>
                        </Link>
                        <span aria-hidden className="h-5 w-px bg-border" />
                      </>
                    ) : null}

                    {/* The buttons carry the counts, so only the read-only
                        tally is rendered for visitors who cannot vote. */}
                    {isPresetOwner ? (
                      <>
                        <VoteTally
                          upCount={preset.vote_up_count}
                          downCount={preset.vote_down_count}
                        />
                        <p className="text-sm text-muted-foreground">
                          {t("preset-vote-own-preset-hint")}
                        </p>
                      </>
                    ) : user ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {t("preset-vote-your-vote")}
                        </span>
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
                      <>
                        <VoteTally
                          upCount={preset.vote_up_count}
                          downCount={preset.vote_down_count}
                        />
                        <Link
                          href="/signin"
                          className="text-sm font-semibold text-foreground underline underline-offset-4 hover:text-primary"
                        >
                          {t("preset-vote-signin-action")}
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {isPresetOwner ? (
                  <Button
                    size="lg"
                    className="h-11 shrink-0 px-8 text-base"
                    nativeButton={false}
                    render={<Link href={`/presets/${preset.id}/edit`} />}
                  >
                    <PencilIcon data-icon="inline-start" />
                    {t("preset-detail-edit-button")}
                  </Button>
                ) : null}
              </div>

              {description ? (
                <p className="max-w-[70ch] text-base leading-relaxed whitespace-pre-line text-muted-foreground">
                  {description}
                </p>
              ) : null}

              {customIR?.url ? (
                <Alert className="w-full">
                  <AlertTitle>{t("preset-detail-custom-ir-title")}</AlertTitle>
                  <AlertDescription>
                    <a
                      href={customIR.url}
                      target="_blank"
                      rel="noreferrer"
                      title={customIR.url}
                      className="flex min-w-0 items-start gap-1.5 font-medium text-primary underline underline-offset-4"
                    >
                      {/* `flex-1` only bounds the width inside a flex row, and
                          `break-all` wraps the URL instead of letting it
                          overflow on narrow screens. */}
                      <span className="min-w-0 flex-1 break-all">
                        {customIR.url}
                      </span>
                      <ExternalLinkIcon
                        className="mt-0.5 size-3.5 shrink-0"
                        aria-hidden
                      />
                    </a>
                  </AlertDescription>
                  <AlertAction>
                    <div className="flex shrink-0 items-center gap-3">
                      <Separator orientation="vertical" className="h-8" />
                      <span className="flex flex-1 flex-col items-end justify-between">
                        <span className="font-bold">
                          {t("preset-detail-custom-ir-distance-label")}
                        </span>
                        <span className="text-sm font-semibold tabular-nums">
                          {customIR.distance}
                        </span>
                      </span>
                    </div>
                  </AlertAction>
                </Alert>
              ) : null}

              {model ? (
                <KnobsPanel
                  model={model}
                  knobValues={knobValues}
                  title={tCommon("knob-values-title")}
                >
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
                    {Object.entries(model.knobs).map(
                      ([knobName, [minValue, maxValue]]) => (
                        <KnobField
                          key={`knob-value-${model.id}-${knobName}`}
                          readOnly
                          label={knobName.replaceAll("_", " ")}
                          value={knobValues[knobName] ?? 0}
                          min={minValue}
                          max={maxValue}
                        />
                      )
                    )}
                  </dl>
                </KnobsPanel>
              ) : null}
            </div>
          )}
        </Container>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: await serverSideTranslations(
    locale!,
    ["common", "presetDetail"],
    nextI18nextConfig
  ),
});

export default PresetDetails;
