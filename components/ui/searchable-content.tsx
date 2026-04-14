'use client';

import { Search, Loader2 } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';

interface SearchableContentProps {
  placeholder?: string;
  /** Content rendered to the left of the search input (e.g. a heading or count) */
  header?: React.ReactNode;
  headerClassName?: string;
  children: React.ReactNode;
}

/**
 * Wraps a search input + content area so that typing dims the content
 * and shows a spinner while Next.js fetches new server-component data.
 *
 * The URL-based search pattern (?search=...) is kept intact — no client state
 * for the actual data, just for the loading overlay.
 */
export function SearchableContent({
  placeholder = 'Search...',
  header,
  headerClassName,
  children,
}: SearchableContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get('search') ?? '');
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleChange(newValue: string) {
    setValue(newValue);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue) {
        params.set('search', newValue);
      } else {
        params.delete('search');
      }
      params.delete('page');
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);
  }

  return (
    <>
      {/* Header row: left slot + search input */}
      <div
        className={`p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-4 flex-wrap ${headerClassName ?? ''}`}
      >
        {header}
        <div className="relative w-64">
          {isPending ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin pointer-events-none" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* Content area — dimmed + spinner overlay while loading */}
      <div className="relative">
        <div
          className={`transition-opacity duration-150 ${
            isPending ? 'opacity-40 pointer-events-none select-none' : ''
          }`}
        >
          {children}
        </div>

        {isPending && (
          <div className="absolute inset-0 flex items-start justify-center pt-16 pointer-events-none">
            <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-full px-4 py-2 shadow-sm text-sm text-neutral-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching…
            </div>
          </div>
        )}
      </div>
    </>
  );
}
