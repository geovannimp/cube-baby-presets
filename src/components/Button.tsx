import clsx from "clsx";
import React from "react";

type HTMLButtonProps = React.ComponentProps<"button">;

export const Button = React.forwardRef<HTMLButtonElement, HTMLButtonProps>(
  function ForwardButton({ className, disabled, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={clsx(
          "px-4 py-2 font-medium cursor-pointer tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80",
          disabled && "bg-slate-500 hover:bg-slate-500 cursor-default",
          className
        )}
        {...props}
      />
    );
  }
);
