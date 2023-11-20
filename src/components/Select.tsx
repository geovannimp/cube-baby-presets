import { Listbox, Transition } from "@headlessui/react";
import React, { useMemo } from "react";

interface SelectProps<T> {
  className?: string;
  label: string;
  name?: string;
  value?: string;
  onChange: (value: string) => void;
  extractLabel: (value: T) => string;
  extractValue: (value: T) => string;
  options: T[];
  disabled?: boolean;
}

function ForwardSelect<T>(
  {
    label,
    name,
    value,
    onChange,
    extractLabel,
    extractValue,
    options,
    disabled,
    className,
  }: SelectProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const map = useMemo(() => {
    return new Map([
      ...options.map((option) => [extractValue(option), option] as [string, T]),
    ]);
  }, [options, extractValue]);

  const selectedObject = useMemo(
    () => (value ? map.get(value) : undefined),
    [map, value]
  );

  return (
    <Listbox
      as={"div"}
      ref={ref}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`z-10 ${className}`}
    >
      <div className="relative block">
        <Listbox.Label className="absolute left-4 top-2 text-xs font-medium text-gray-500 pointer-events-none">
          {label}
        </Listbox.Label>
        <Listbox.Button className="block w-full px-4 py-2 pt-6 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring text-left">
          {selectedObject ? extractLabel(selectedObject) : " "}
        </Listbox.Button>
      </div>
      <Transition
        className={"z-50 shadow-2xl"}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Listbox.Options className="absolute top-2 left-2 right-2 max-h-60 py-1 overflow-auto rounded-md text-gray-700 bg-white border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 text-base drop-shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {Array.from(map.entries()).map(([value, option], index) => (
            <Listbox.Option
              className="px-4 py-2 my-1 hover:bg-slate-700 hover:text-white cursor-pointer"
              key={`option-${index}`}
              value={value}
            >
              {extractLabel(option)}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
}

export const Select = React.forwardRef(ForwardSelect) as <T extends {}>(
  props: SelectProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReturnType<typeof ForwardSelect>;
