import { Listbox, Transition } from "@headlessui/react";

interface SelectProps<T> {
  label: string;
  value?: T;
  onChange: (value: T) => void;
  extractLabel: (value: T) => string;
  options: T[];
  disabled: boolean;
}

export const Select = <T = string,>({
  label,
  value,
  onChange,
  extractLabel,
  options,
  disabled,
}: SelectProps<T>) => {
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <label className="relative block">
        <Listbox.Label className="absolute left-4 top-4 text-xs font-medium text-gray-500 pointer-events-none">
          {label}
        </Listbox.Label>
        <Listbox.Button className="block w-full px-4 py-2 pt-6 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring text-left">
          {value ? extractLabel(value) : " "}
        </Listbox.Button>
      </label>
      <Transition
        className={"z-50 shadow-2xl"}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((option, index) => (
            <Listbox.Option
              className="px-4 py-2 my-1 hover:bg-slate-700 cursor-pointer"
              key={`option-${index}`}
              value={option}
            >
              {extractLabel(option)}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
};
