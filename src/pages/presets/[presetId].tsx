import { useUser } from "@supabase/supabase-auth-helpers/react";
import type { GetServerSideProps, GetStaticProps, NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
import { Model } from "../../services/modelService";
import {
  PresetKnobsValueMap,
  PresetService,
} from "../../services/presetService";

const NewPreset: NextPage = () => {
  const { t } = useTranslation("preset");
  const { user } = useUser();
  const router = useRouter();
  const { presetId } = router.query;

  const [selectedModel, setSelectedModel] = useState<Model>();
  const { models } = useModels();
  const [knobValues, setKnobValues] = useState<PresetKnobsValueMap>();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [customIR, setCustomIR] = useState<string>("");
  const [customIRDistance, setCustomIRDistance] = useState<number>(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  const { preset } = usePreset(
    presetId && presetId !== "new" ? Number(presetId) : undefined
  );

  const dialogMode =
    presetId === "new"
      ? "creating"
      : preset?.user_id === user?.id
      ? "editing"
      : "viewing";

  const handleSubmit = async () => {
    if (customIR) {
      if (
        !/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(
          customIR
        )
      ) {
        toast.error(t("preset-invalid-custom-ir"), {
          position: "bottom-center",
          style: {
            marginBottom: 25,
          },
        });
        return;
      }
      if (customIRDistance < 0 || customIRDistance > 100) {
        toast.error(t("preset-invalid-custom-ir-distance"), {
          position: "bottom-center",
          style: {
            marginBottom: 50,
          },
        });
        return;
      }
    }
    if (user && name && knobValues && selectedModel) {
      setSaving(true);
      if (preset?.id) {
        await PresetService.updatePreset({
          id: preset.id,
          name,
          knobs_values: knobValues,
          model_id: selectedModel.id,
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
          model_id: selectedModel.id,
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
      setSaving(false);
      router.replace("/account");
    }
  };

  const showDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    if (preset && models) {
      setName(preset.name);
      setDescription(preset.description);
      setCustomIR(preset.custom_ir?.url ?? "");
      setCustomIRDistance(preset.custom_ir?.distance ?? 0);
      setKnobValues(preset.knobs_values);
      setSelectedModel(models.find((model) => model.id === preset.model_id));
    }
  }, [preset, models]);

  useEffect(() => {
    if (selectedModel) {
      setKnobValues(
        Object.keys(selectedModel.knobs).reduce(
          (obj, knobName) => ({ ...obj, [knobName]: 0 }),
          {}
        )
      );
    }
  }, [selectedModel]);

  return (
    <>
      <Head>
        <title>Cube Baby Presets - New Preset</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <Container className="gap-4 my-8">
        {dialogMode !== "creating" && !preset ? (
          <div className=" flex flex-col justify-center items-center w-full">
            <LoadingDots />
          </div>
        ) : (
          <>
            <p className="font-bold text-2xl">
              {dialogMode === "creating"
                ? t("preset-creating-title", { context: "creating" })
                : dialogMode === "editing"
                ? t("preset-creating-title", { context: "editing" })
                : t("preset-creating-title", { context: "viewing" })}
            </p>
            <Input
              label={`${t("name-field")} *`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={dialogMode === "viewing"}
              required
            />
            <Textarea
              label={`${t("description-field")} *`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={dialogMode === "viewing"}
              required
            />
            {models ? (
              <Select<Model>
                label={`${t("version-field")} *`}
                value={selectedModel}
                onChange={setSelectedModel}
                disabled={dialogMode === "viewing"}
                extractLabel={(model) => model.name}
                options={models}
              />
            ) : (
              <LoadingDots />
            )}
            {selectedModel && knobValues && (
              <>
                <div className="flex flex-row gap-6">
                  <Input
                    containerClassName="w-full"
                    label={`${t("custom-ir-field")}`}
                    value={customIR}
                    placeholder="https://"
                    onChange={(e) => setCustomIR(e.target.value)}
                    disabled={dialogMode === "viewing"}
                    required
                  />
                  <Input
                    containerClassName="w-32"
                    label={`${t("custom-ir-distance-field")}`}
                    type={"number"}
                    value={customIRDistance}
                    onChange={(e) =>
                      setCustomIRDistance(Number(e.target.value))
                    }
                    disabled={dialogMode === "viewing"}
                    required
                  />
                </div>
                <KnobsForm
                  model={selectedModel}
                  knobValues={knobValues}
                  onChange={setKnobValues}
                  disabled={dialogMode === "viewing"}
                  disableIR={!!customIR}
                />
                {(dialogMode === "creating" || dialogMode === "editing") && (
                  <div className="flex flex-col my-4 mb-8 justify-between sm:flex-row-reverse">
                    <Button
                      onClick={handleSubmit}
                      className="w-full mb-4 sm:w-32 sm:mb-0"
                      disabled={!(name && selectedModel)}
                    >
                      {saving ? (
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
  props: await serverSideTranslations(locale!, ["common", "preset"]),
});

export default NewPreset;
