function Loader({ text = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#E5E1DC] border-t-[#A68A64]" />
      <span>{text}</span>
    </div>
  );
}

export default Loader;
