import type { ReactNode } from "react";
import { Skeleton } from "./Skeleton";

export interface TableColumn<T = any> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" className="h-4" />
        </td>
      ))}
    </tr>
  );
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found",
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-950/5">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/80 border-b border-gray-950/5">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-3 text-[13px] font-medium text-gray-500"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-950/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} cols={columns.length} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-950/5">
        <div className="py-16 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
          </div>
          <p className="text-sm font-medium text-gray-900">{emptyMessage}</p>
          <p className="text-[13px] text-gray-500 mt-1">There are no records to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-950/5">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/80 border-b border-gray-950/5">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-[13px] font-medium text-gray-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-950/5">
          {data.map((item, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(item)}
              className={`${
                onRowClick ? "cursor-pointer hover:bg-gray-50/50" : "hover:bg-gray-50/30"
              } transition-colors group`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3.5 text-sm text-gray-700">
                  {col.render ? col.render(item) : String(item[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}