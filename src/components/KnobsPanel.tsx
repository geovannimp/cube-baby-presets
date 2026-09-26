import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Model } from "../services/modelService";
import { Pedal } from "./Pedal";

type KnobsPanelProps = {
  model: Model;
  knobValues: Record<string, number>;
  /**
   * Omitted on the details page, which renders the pedal as a read-only
   * preview of the saved values.
   */
  onChange?: (newValue: Record<string, number>) => void;
  title: string;
  children: ReactNode;
};

/**
 * Card shared by the preset editor and the preset details page: pedal on top,
 * then whatever the caller needs below the separator (sliders when editing,
 * plain values when viewing).
 */
export const KnobsPanel = ({
  model,
  knobValues,
  onChange,
  title,
  children,
}: KnobsPanelProps) => (
  <Card className="w-full gap-0 overflow-hidden py-0" size="sm">
    <div className="overflow-x-auto p-3">
      <div className="flex min-w-min justify-center">
        <Pedal
          model={model}
          knobValues={knobValues}
          onChange={onChange}
          disabled={!onChange}
        />
      </div>
    </div>

    <Separator />

    <div className="flex flex-col gap-5 px-4 py-5 md:px-6 md:py-6">
      <p className="font-heading text-sm font-medium tracking-tight text-foreground">
        {title}
      </p>

      {children}
    </div>
  </Card>
);
