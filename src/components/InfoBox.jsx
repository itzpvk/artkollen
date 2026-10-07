// Explains what the data does and does not show (Figma: "Info box").
export default function InfoBox({ children }) {
  return (
    <p className="info-box" role="note">
      <span className="info-box__icon" aria-hidden="true">
        i
      </span>
      <span>{children}</span>
    </p>
  );
}
