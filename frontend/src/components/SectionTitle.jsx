function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-[#1F1F1F] md:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-1.5 text-sm text-[#6B6B6B]">{subtitle}</p> : null}
    </div>
  );
}

export default SectionTitle;
