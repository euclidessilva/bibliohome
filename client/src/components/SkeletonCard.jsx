export default function SkeletonCard() {
  return (
    <div className="book-card">
      <div className="skeleton skeleton-cover" />
      <div className="skeleton skeleton-text medium" style={{ marginTop: '0.5rem' }} />
      <div className="skeleton skeleton-text short" style={{ marginTop: '0.3rem' }} />
    </div>
  );
}
