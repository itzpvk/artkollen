// Two or more mutually exclusive buttons (Figma: "Segmented toggle").
// Uses aria-pressed so screen readers announce which option is on.
export default function SegmentedToggle({ label, value, onChange, options }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          lang={o.lang}
          className="segmented__option"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
