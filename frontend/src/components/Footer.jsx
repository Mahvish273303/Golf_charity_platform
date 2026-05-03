function Footer() {
  return (
    <footer className="mt-16 border-t border-[#E5E1DC] bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-[#6B6B6B] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-[#1F1F1F]">Golf Charity Platform</p>
          <p className="mt-0.5">Play with purpose. Support real causes.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[#E5E1DC] px-3 py-1 text-[#3A2E2A]">Monthly Draws</span>
          <span className="rounded-full border border-[#E5E1DC] px-3 py-1 text-[#3A2E2A]">Charity Impact</span>
          <span className="rounded-full border border-[#E5E1DC] px-3 py-1 text-[#3A2E2A]">Secure JWT Auth</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
