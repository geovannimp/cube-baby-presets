import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { useDeletePreset } from "../hooks/useDeletePreset";
import { Button } from "./Button";

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
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose}>
        {/*
          Use one Transition.Child to apply one transition to the backdrop...
        */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/*
              ...and another Transition.Child to apply a separate transition
              to the contents.
            */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="max-w-2xl px-4 py-4 mx-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
                <Dialog.Title className="font-bold text-lg text-left">
                  {t("delete-preset-dialog-title")}
                </Dialog.Title>
                <Dialog.Description className="my-8">
                  {t("delete-preset-dialog-description")}
                </Dialog.Description>
                <div className="flex justify-between">
                  <Button
                    className="bg-transparent hover:bg-slate-600"
                    onClick={onClose}
                  >
                    <span>{t("delete-preset-dialog-cancel-button")}</span>
                  </Button>
                  <Button
                    className="bg-red-700 hover:bg-red-500"
                    onClick={deletePreset}
                  >
                    <span>{t("delete-preset-dialog-confirm-button")}</span>
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
