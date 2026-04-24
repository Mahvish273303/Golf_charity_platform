const variantStyles = {
  primary:
    "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-600 hover:to-blue-500",
  dark: "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200",
  light:
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100",
  soft: "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200",
  danger: "bg-red-500/90 text-white hover:bg-red-600",
};

function Button({ children, className = "", loading = false, variant = "primary", ...props }) {
  const style = variantStyles[variant] || variantStyles.primary;
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${style} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

export default Button;
