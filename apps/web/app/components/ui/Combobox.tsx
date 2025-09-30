"use client";

import { Fragment } from "react";
import { Combobox as HeadlessCombobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";

export function Combobox({
  options,
  value,
  onChange,
  displayValue,
  children,
  name,
  defaultValue,
}: {
  options: any[];
  value: any;
  onChange: (val: any) => void;
  displayValue: (val: any) => string;
  children: (val: any) => React.ReactNode;
  name?: string;
  defaultValue?: any;
}) {
  return (
    <HeadlessCombobox value={value} onChange={onChange} name={name} defaultValue={defaultValue}>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded border bg-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
          <HeadlessCombobox.Input
            className="w-full border-none py-2 pl-3 pr-10 leading-5 text-gray-900 focus:ring-0"
            displayValue={displayValue}
          />
          <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </HeadlessCombobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => {}}
        >
          <HeadlessCombobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
            {options.map((option, idx) => (
              <HeadlessCombobox.Option
                key={idx}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? "bg-blue-600 text-white" : "text-gray-900"
                  }`
                }
                value={option}
              >
                {({ selected }) => (
                  <>
                    {children(option)}
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </HeadlessCombobox.Option>
            ))}
          </HeadlessCombobox.Options>
        </Transition>
      </div>
    </HeadlessCombobox>
  );
}

export function ComboboxOption({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function ComboboxLabel({ children }: { children: React.ReactNode }) {
  return <span className="block">{children}</span>;
}
