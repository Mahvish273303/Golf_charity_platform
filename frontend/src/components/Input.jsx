function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-[#1F1F1F]">{label}</span>
      <input
        className={`w-full rounded-lg border border-[#E5E1DC] bg-white px-3 py-2.5 text-sm text-[#1F1F1F] outline-none transition-all duration-200 placeholder:text-[#6B6B6B] focus:border-[#A68A64] focus:ring-1 focus:ring-[#A68A64] ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  );
}

export default Input;
