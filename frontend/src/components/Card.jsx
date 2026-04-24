function Card({ title, action, children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-200/70 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-wide text-slate-900">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
