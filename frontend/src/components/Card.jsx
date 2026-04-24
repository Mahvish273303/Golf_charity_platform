function Card({ title, action, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200/50 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg ${className}`}
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
