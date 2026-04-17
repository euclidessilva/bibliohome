export default function ProgressBar({ value = 0, className = '' }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`progress-bar ${className}`}>
      <div className="progress-bar-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
