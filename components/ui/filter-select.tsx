'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface FilterSelectProps {
  param: string;
  placeholder: string;
  options: { value: string; label: string }[];
}

export function FilterSelect({ param, placeholder, options }: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const value = searchParams.get(param) ?? '';

  function handleChange(newValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set(param, newValue);
    } else {
      params.delete(param);
    }
    params.delete('page');
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-neutral-700 dark:text-neutral-300"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
