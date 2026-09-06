export function AppLoadingSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse p-2 sm:p-4">
      {/* Page header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-custom/10">
        <div className="space-y-2.5">
          <div className="h-8 w-48 bg-slate-custom/10 rounded-xl" />
          <div className="h-4 w-72 max-w-full bg-slate-custom/10 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-slate-custom/10 rounded-xl" />
      </div>

      {/* Stats/Metrics row skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-custom/10 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-slate-custom/10 rounded" />
              <div className="h-8 w-8 bg-slate-custom/10 rounded-xl" />
            </div>
            <div className="h-7 w-28 bg-slate-custom/10 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Content cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-custom/10 shadow-sm space-y-4">
          <div className="h-6 w-40 bg-slate-custom/10 rounded-md" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-linen-canvas rounded-xl border border-slate-custom/5" />
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-custom/10 shadow-sm space-y-4">
          <div className="h-6 w-32 bg-slate-custom/10 rounded-md" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-linen-canvas rounded-xl border border-slate-custom/5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppLoadingSkeleton;
