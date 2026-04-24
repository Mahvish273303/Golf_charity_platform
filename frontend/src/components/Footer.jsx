function Footer() {
  return (
    <footer className="mt-14 border-t border-white/60 bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold tracking-wide text-slate-800">Golf Charity Platform</p>
          <p>Play with purpose. Support real causes.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">Monthly Draws</span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">Charity Impact</span>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">Secure JWT Auth</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
