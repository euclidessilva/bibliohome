export default function StatCard({ icon, iconClass, label, value, sublabel }) {
  return (
    <div className="card stat-card" id={`stat-${label?.toLowerCase().replace(/\s/g, '-')}`}>
      <div className={`stat-card-icon ${iconClass || ''}`}>
        {icon}
      </div>
      <div className="label-uppercase">{label}</div>
      <div className="stat-card-number">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</div>
      <div className="stat-card-label">{sublabel}</div>
    </div>
  );
}
