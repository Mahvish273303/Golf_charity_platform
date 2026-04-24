function Loader({ text = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
      <span>{text}</span>
    </div>
  );
}

export default Loader;
