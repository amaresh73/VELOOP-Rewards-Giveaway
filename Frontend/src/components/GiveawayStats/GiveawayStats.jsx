function GiveawayStats() {
  const stats = [
    { value: '26K+', label: 'Active Members' },
    { value: '3.8K', label: 'Rewards Claimed' },
    { value: '99.2%', label: 'Verified Winners' }
  ];

  return (
    <div className="d-flex flex-wrap gap-4 mt-4">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-box">
          <div className="fw-bold fs-3">{stat.value}</div>
          <small className="text-muted">{stat.label}</small>
        </div>
      ))}
    </div>
  );
}

export default GiveawayStats;
