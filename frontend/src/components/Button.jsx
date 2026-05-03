const variantStyles = {
  primary: "btn-primary text-white hover:shadow-md hover:shadow-[#A68A64]/20",
  dark:    "bg-[#3A2E2A] text-white hover:bg-[#5A463F] hover:shadow-md hover:shadow-[#3A2E2A]/20",
  light:   "bg-white text-[#3A2E2A] border border-[#E5E1DC] hover:bg-[#F3F2EF] hover:border-[#A68A64]",
  soft:    "bg-[#F5F3F0] text-[#3A2E2A] border border-[#E5E1DC] hover:bg-[#EDE9E4] hover:border-[#A68A64]",
  danger:  "bg-red-500 text-white hover:bg-red-600",
};

function Button({ children, className = "", loading = false, variant = "primary", ...props }) {
  const style = variantStyles[variant] || variantStyles.primary;
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A68A64] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${style} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

export default Button;
