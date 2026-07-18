interface DeliverableItemProps {
  name: string;
  status: "done" | "pending" | "todo";
  meta?: string;
}

const statusConfig = {
  done: {
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
    ),
    boxClass: "bg-emerald-status/10 text-emerald-status",
    labelClass: "text-graphite",
    meta: "Approved",
  },
  pending: {
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
    ),
    boxClass: "bg-amber-tag/10 text-amber-tag",
    labelClass: "text-graphite",
    meta: "Awaiting approval",
  },
  todo: {
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth={2} /></svg>
    ),
    boxClass: "bg-sky-wash",
    labelClass: "text-ash",
    meta: "",
  },
};

export function DeliverableItem({ name, status, meta }: DeliverableItemProps) {
  const config = statusConfig[status];
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-custom/10 last:border-0 last:pb-0">
      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${config.boxClass}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${config.labelClass}`}>{name}</div>
        <div className="text-xs text-ash">{meta || config.meta}</div>
      </div>
    </div>
  );
}
