import clsx from "clsx";
import React from "react";

type TextareaProps = {
  label: string;
  helperText?: string;
  error?: boolean;
} & React.ComponentProps<"textarea">;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function ForwardTextarea(
    { label, className, helperText, error, ...props },
    ref
  ) {
    return (
      <label className="relative block" htmlFor={props.name}>
        <span
          className={clsx(
            "absolute left-4 top-2 text-xs font-medium text-gray-500 pointer-events-none z-10",
            error && "!text-red-500"
          )}
        >
          {label}
        </span>
        <div className="relative w-full">
          <p className="w-full px-4 py-8 min-h-[8rem] pt-6 whitespace-pre-wrap invisible pointer-events-none">
            {`${props.value}`}
          </p>
          <textarea
            ref={ref}
            className={clsx(
              "block w-full absolute top-0 bottom-0 px-4 py-2 pt-6 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring resize-none overflow-hidden",
              className,
              error && "!border-red-500"
            )}
            {...props}
          />
        </div>
        {helperText && (
          <span className="text-xs px-4 text-red-500">{helperText}</span>
        )}
      </label>
    );
  }
);
