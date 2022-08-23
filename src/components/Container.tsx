import clsx from "clsx";

export const Container = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      className={clsx("flex flex-col px-6 max-w-5xl w-full", className)}
      {...props}
    />
  );
};
