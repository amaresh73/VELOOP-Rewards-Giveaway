const trustPoints = [
  {
    icon: '✓',
    title: '100% Transparent',
    description: 'Giveaway rules, prize details, and entry requirements are clearly displayed on every giveaway page.',
    color: 'success'
  },
  {
    icon: '🔒',
    title: 'Secure Platform',
    description: 'User information is handled responsibly. Prize claim details are never shared publicly.',
    color: 'primary'
  },
  {
    icon: '⚖️',
    title: 'Fair Participation',
    description: 'One entry per verified member per giveaway event. Fraud detection protects every participant.',
    color: 'accent'
  },
  {
    icon: '🏆',
    title: 'Reward Transparency',
    description: 'Winners are selected by the backend after the giveaway closes. The selection process is documented and auditable.',
    color: 'warning'
  }
];

function TrustSection() {
  return (
    <section className="trust-section">
      <div className="trust-section__header">
        <p className="text-uppercase text-primary mb-2 small fw-bold letter-spacing-wide">Why VELOOP</p>
        <h2 className="fw-bold mb-2">Built on trust &amp; transparency</h2>
        <p className="text-white-50 mb-0">
          Every giveaway is designed with integrity. Here's what makes VELOOP Rewards different.
        </p>
      </div>
      <div className="trust-section__grid">
        {trustPoints.map((point) => (
          <div key={point.title} className={`trust-point trust-point--${point.color}`}>
            <div className="trust-point__icon" aria-hidden="true">{point.icon}</div>
            <div>
              <h5 className="trust-point__title">{point.title}</h5>
              <p className="trust-point__desc">{point.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustSection;
