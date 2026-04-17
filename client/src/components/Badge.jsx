export default function Badge({ type = 'category', className = '', children }) {
  const baseClass = type === 'category' ? 'badge badge-category'
    : type === 'match' ? 'badge badge-match'
    : `badge badge-status ${children?.toLowerCase?.() || className}`;

  return <span className={`${baseClass} ${className}`}>{children}</span>;
}
