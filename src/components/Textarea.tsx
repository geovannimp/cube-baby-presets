type TextareaProps = {
  label: string;
} & React.ComponentProps<"textarea">;

export const Textarea = ({ label, className, ...props }: TextareaProps) => {
  return (
    <label className="relative block" htmlFor={props.id}>
      <span className="absolute left-4 top-4 text-xs font-medium text-gray-500 pointer-events-none z-10">
        {label}
      </span>
      <p className="w-full px-4 py-8 min-h-[8rem] pt-6 mt-2 whitespace-pre-wrap invisible pointer-events-none">
        {`${props.value}`}
      </p>
      <textarea
        className="block w-full absolute top-0 bottom-0 px-4 py-2 pt-6 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring resize-none overflow-hidden"
        {...props}
      />
    </label>
  );
};
