import clsx from "clsx";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

/** Block shared by the details readout and the editable row. */
const BLOCK =
  "relative flex items-center justify-between gap-3 overflow-hidden rounded-lg bg-muted/50 px-3.5 py-2.5 transition-shadow has-[[data-slot=slider-thumb]:focus-visible]:ring-2 has-[[data-slot=slider-thumb]:focus-visible]:ring-ring/50";
const LABEL =
  "truncate text-xs font-medium tracking-wide text-foreground uppercase";
const VALUE = "flex h-8 items-center text-sm font-semibold tabular-nums";

/**
 * The slider is only an interaction layer covering the whole block, so all of
 * its own parts are hidden and the block's background does the drawing. The
 * thumb is taken out of flow so the draggable range is the full block width.
 */
const SLIDER =
  "absolute inset-0 z-10 h-full w-full cursor-ew-resize [&_[data-slot=slider-control]]:h-full [&_[data-slot=slider-track]]:bg-transparent! [&_[data-slot=slider-track]]:rounded-none [&_[data-slot=slider-range]]:bg-transparent! [&_[data-slot=slider-thumb]]:absolute [&_[data-slot=slider-thumb]]:opacity-0";

type KnobFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  /**
   * Details view: the value is shown as text with no interaction. Renders
   * `dt`/`dd` so callers can keep a description list.
   */
  readOnly?: boolean;
  /** Greys the row out, e.g. the cab knob when a custom IR replaces it. */
  disabled?: boolean;
  error?: string;
  /** Only used when editable: ties the label to the number input. */
  id?: string;
  onValueChange?: (value: number) => void;
  onCommit?: () => void;
  onBlur?: () => void;
};

export const KnobField = ({
  label,
  value,
  min,
  max,
  readOnly = false,
  disabled = false,
  error,
  id,
  onValueChange,
  onCommit,
  onBlur,
}: KnobFieldProps) => {
  const span = max - min;
  const filled = `${span > 0 ? ((value - min) / span) * 100 : 0}%`;

  const fill = (
    <div
      aria-hidden
      className="absolute inset-y-0 left-0 bg-primary/20"
      style={{ width: filled }}
    />
  );

  if (readOnly) {
    return (
      <div className={clsx(BLOCK, disabled && "opacity-40")}>
        {fill}
        <dt className={clsx(LABEL, "relative")}>{label}</dt>
        <dd className={clsx(VALUE, "relative")}>{value}</dd>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className={clsx(BLOCK, disabled && "opacity-40")}>
        {fill}

        <Slider
          id={undefined}
          className={SLIDER}
          value={[value]}
          min={min}
          max={max}
          step={1}
          disabled={disabled}
          aria-label={label}
          onValueChange={(next) => {
            const selected = Array.isArray(next) ? next[0] : next;
            onValueChange?.(selected ?? min);
          }}
          onValueCommitted={onCommit}
        />

        <label htmlFor={id} className={clsx(LABEL, "pointer-events-none relative")}>
          {label}
        </label>

        {/* Above the drag layer so it stays clickable. */}
        <Input
          className="relative z-20 h-8 w-11 px-0.5 text-center tabular-nums"
          type="number"
          name={id ? `${id}-number` : undefined}
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          aria-invalid={!!error}
          aria-label={`${label} value`}
          onBlur={onBlur}
          onChange={(event) => onValueChange?.(Number(event.target.value))}
        />
      </div>

      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  );
};
