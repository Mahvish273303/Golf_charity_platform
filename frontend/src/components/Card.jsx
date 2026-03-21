function Card({ title, action, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-indigo-100/70 bg-white/95 p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-lg ${className}`}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
