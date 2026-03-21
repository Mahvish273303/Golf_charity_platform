const variantStyles = {
  primary:
    "bg-gradient-to-r from-indigo-600 to-sky-500 text-white hover:from-indigo-500 hover:to-sky-400",
  dark: "bg-slate-800 text-white hover:bg-slate-700",
  light:
    "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800",
  soft: "bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100",
};

function Button({ children, className = "", loading = false, variant = "primary", ...props }) {
  const style = variantStyles[variant] || variantStyles.primary;
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${style} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

export default Button;
