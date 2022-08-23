import clsx from "clsx";

type InputProps = {
  label: string;
  containerClassName?: string;
} & React.ComponentProps<"input">;

export const Input = ({
  label,
  className,
  containerClassName,
  ...props
}: InputProps) => {
  return (
    <label
      className={clsx("relative block", containerClassName)}
      htmlFor={props.id}
    >
      <span className="absolute left-4 top-4 text-xs font-medium text-gray-500 pointer-events-none">
        {label}
      </span>

      <input
        className={clsx(
          "block w-full px-4 py-2 pt-6 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring",
          className
        )}
        {...props}
      />
    </label>
  );
};
