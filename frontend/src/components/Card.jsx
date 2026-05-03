function Card({ title, action, children, className = "" }) {
  return (
    <div
      className={`card-premium rounded-xl border border-[#E5E1DC] bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#1F1F1F]">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
