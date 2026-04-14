import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  searchParams?: Record<string, string>;
  className?: string;
}

export function Pagination({
  page,
  total,
  pageSize,
  basePath,
  searchParams = {},
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  function buildUrl(targetPage: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(targetPage) });
    return `${basePath}?${params.toString()}`;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-700', className)}>
      <p className="text-sm text-neutral-500">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link
            href={buildUrl(page - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-300 dark:text-neutral-600 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
            Prev
          </span>
        )}

        <span className="px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400">
          {page} / {totalPages}
        </span>

        {page < totalPages ? (
          <Link
            href={buildUrl(page + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-300 dark:text-neutral-600 cursor-not-allowed">
            Next
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );
}
