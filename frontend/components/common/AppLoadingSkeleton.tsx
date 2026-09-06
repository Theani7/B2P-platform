export function AppLoadingSkeleton() {
  const shimmer = "bg-gradient-to-r from-slate-custom/5 via-slate-custom/12 to-slate-custom/5 bg-[length:200%_100%] animate-shimmer";

  return (
    <div className="w-full space-y-6 p-2 sm:p-4 transition-opacity duration-200 ease-out">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-custom/10">
        <div className="space-y-2.5">
          <div className={`h-8 w-44 rounded-xl ${shimmer}`} />
          <div className={`h-4 w-64 max-w-full rounded-md ${shimmer}`} />
        </div>
        <div className={`h-10 w-32 rounded-xl ${shimmer}`} />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-custom/10 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className={`h-4 w-20 rounded ${shimmer}`} />
              <div className={`h-8 w-8 rounded-xl ${shimmer}`} />
            </div>
            <div className={`h-7 w-28 rounded-lg ${shimmer}`} />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-custom/10 shadow-sm space-y-4">
          <div className={`h-6 w-40 rounded-md ${shimmer}`} />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-16 rounded-xl border border-slate-custom/5 ${shimmer}`} />
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-custom/10 shadow-sm space-y-4">
          <div className={`h-6 w-32 rounded-md ${shimmer}`} />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-12 rounded-xl border border-slate-custom/5 ${shimmer}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppLoadingSkeleton;

