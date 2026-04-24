function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-wide text-gray-800 md:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );
}

export default SectionTitle;
