function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold tracking-wide text-slate-700">{label}</span>
      <input
        className={`w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

export default Input;
