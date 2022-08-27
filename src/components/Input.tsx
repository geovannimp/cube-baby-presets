import clsx from "clsx";
import React from "react";

type InputProps = {
  label: string;
  containerClassName?: string;
  helperText?: string;
  error?: boolean;
} & React.ComponentProps<"input">;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function ForwardInput(
    {
      label,
      className,
      containerClassName,
      helperText,
      error = false,
      ...props
    },
    ref
  ) {
    return (
      <label
        className={clsx("relative block", containerClassName)}
        htmlFor={props.name}
      >
        <span
          className={clsx(
            "absolute left-4 top-2 text-xs font-medium text-gray-500 pointer-events-none",
            error && "!text-red-500"
          )}
        >
          {label}
        </span>

        <input
          ref={ref}
          className={clsx(
            "block w-full px-4 py-2 pt-6 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring",
            className,
            error && "!border-red-500"
          )}
          {...props}
        />

        {helperText && (
          <span className="text-xs px-4 text-red-500">{helperText}</span>
        )}
      </label>
    );
  }
);
