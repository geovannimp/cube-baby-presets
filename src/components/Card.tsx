import clsx from "clsx";

export const Card = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={clsx(
        "max-w-2xl px-4 py-4 mx-auto bg-white rounded-lg shadow-md dark:bg-gray-800",
        className
      )}
      {...props}
    />
  );
};
