import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeletePreset } from "../hooks/useDeletePreset";

interface DeletePresetDialog {
  presetId: number;
  open: boolean;
  onClose: () => void;
}

export const DeletePresetDialog = ({
  presetId,
  open,
  onClose,
}: DeletePresetDialog) => {
  const { t } = useTranslation("preset");
  const router = useRouter();
  const { mutateAsync: deletePresetAsync } = useDeletePreset();

  const deletePreset = () => {
    deletePresetAsync(presetId).then(() => router.replace("/account"));
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <AlertDialogContent size="sm" className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete-preset-dialog-title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete-preset-dialog-description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("delete-preset-dialog-cancel-button")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={deletePreset}>
            {t("delete-preset-dialog-confirm-button")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
