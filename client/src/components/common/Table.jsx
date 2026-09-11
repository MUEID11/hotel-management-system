import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Spinner from './Spinner.jsx';
import EmptyState from './EmptyState.jsx';
import { classNames } from '../../utils/format.js';

const PAGE_SIZE = 10;

export default function Table({
  columns = [],
  data = [],
  loading = false,
  rowKey = 'id',
  emptyTitle = 'No records found',
  emptyMessage = 'Try adjusting your filters or adding a new record.',
  actions,
  pageable = true,
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const paginated = pageable ? data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : data;

  const changePage = useCallback((next) => {
    setPage(() => Math.min(pageCount, Math.max(1, next)));
  }, [pageCount]);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  {column.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12">
                  <Spinner label="Loading…" />
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12">
                  <EmptyState title={emptyTitle} message={emptyMessage} />
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={row[rowKey]} className="transition-colors hover:bg-slate-50/70">
                  {columns.map((column) => (
                    <td key={column.key} className={classNames('px-4 py-3 align-top', column.className)}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageable && !loading && paginated.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <p>
            Showing{' '}
            <span className="font-medium text-slate-900">{(page - 1) * PAGE_SIZE + 1}</span>–
            <span className="font-medium text-slate-900">
              {Math.min(page * PAGE_SIZE, data.length)}
            </span>{' '}
            of <span className="font-medium text-slate-900">{data.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-14 text-center text-xs font-medium text-slate-700">
              Page {page} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={page >= pageCount}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}