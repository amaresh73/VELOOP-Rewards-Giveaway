import { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Alert, Badge, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─── Status helpers ─────────────────────────────────────────────── */
const statusColor = (s = '') => {
  const v = s.toLowerCase();
  if (['live', 'active', 'ending-soon'].includes(v)) return 'success';
  if (v === 'upcoming') return 'primary';
  if (['closed', 'archived', 'ended'].includes(v)) return 'secondary';
  return 'warning';
};

const claimColor = (s = '') => {
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'danger';
  return 'warning';
};

const fmt = (n) => Number(n || 0).toLocaleString();

/* ─── Stat Card Component ────────────────────────────────────────── */
function StatCard({ icon, label, value, accent, trend, sub }) {
  return (
    <div className={`admin-stat-card${accent ? ' admin-stat-card--accent' : ''}`}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="admin-stat-card__icon">{icon}</div>
        {trend && (
          <span className="badge rounded-pill bg-dark text-white-50 border border-secondary border-opacity-25 px-2 py-1" style={{ fontSize: '0.72rem' }}>
            {trend}
          </span>
        )}
      </div>
      <div className="admin-stat-card__value">{value}</div>
      <div className="admin-stat-card__label">{label}</div>
      {sub && <div className="text-white-50 mt-1" style={{ fontSize: '0.75rem' }}>{sub}</div>}
    </div>
  );
}

/* ─── Default Form Values ────────────────────────────────────────── */
const defaultForm = {
  title: '',
  prize: '',
  description: '',
  type: 'Instant Win',
  status: 'draft',
  imageUrl: ''
};

/* ════════════════════════════════════════════════════════════════════
   ADMIN PANEL COMPONENT
   ═════════════════════════════════════════════════════════════════════ */
function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation & responsive sidebar state
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Overview stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Giveaways
  const [giveaways, setGiveaways] = useState([]);
  const [giveawaysLoading, setGiveawaysLoading] = useState(false);
  const [giveawaySearch, setGiveawaySearch] = useState('');
  const [giveawayStatusFilter, setGiveawayStatusFilter] = useState('all');
  const [statusUpdating, setStatusUpdating] = useState(null);

  // Winners
  const [winners, setWinners] = useState([]);
  const [winnersLoading, setWinnersLoading] = useState(false);
  const [selectModal, setSelectModal] = useState(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const [selectMsg, setSelectMsg] = useState('');

  // Claims
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimStatusFilter, setClaimStatusFilter] = useState('all');
  const [claimSearch, setClaimSearch] = useState('');
  const [claimUpdating, setClaimUpdating] = useState(null);

  // Create Giveaway
  const [form, setForm] = useState(defaultForm);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState({ text: '', ok: true });

  // Notification Banner
  const [notice, setNotice] = useState('');

  const triggerNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4500);
  };

  /* ── API Fetchers ───────────────────────────────────────────────── */
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await api.get('/admin/stats');
      setStats(r.data.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadGiveaways = useCallback(async () => {
    setGiveawaysLoading(true);
    try {
      const r = await api.get('/admin/giveaways');
      setGiveaways(r.data.data || []);
    } catch (err) {
      console.error('Failed to load giveaways:', err);
    } finally {
      setGiveawaysLoading(false);
    }
  }, []);

  const loadWinners = useCallback(async () => {
    setWinnersLoading(true);
    try {
      const r = await api.get('/admin/winners');
      setWinners(r.data.data || []);
    } catch (err) {
      console.error('Failed to load winners:', err);
    } finally {
      setWinnersLoading(false);
    }
  }, []);

  const loadClaims = useCallback(async () => {
    setClaimsLoading(true);
    try {
      const r = await api.get('/admin/claims');
      setClaims(r.data.data || []);
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setClaimsLoading(false);
    }
  }, []);

  /* Load data on tab change */
  useEffect(() => {
    if (tab === 'overview') {
      loadStats();
      loadGiveaways();
      loadClaims();
    }
    if (tab === 'giveaways') loadGiveaways();
    if (tab === 'winners') {
      loadWinners();
      loadGiveaways();
    }
    if (tab === 'claims') loadClaims();
  }, [tab, loadStats, loadGiveaways, loadWinners, loadClaims]);

  /* ── Action Handlers ────────────────────────────────────────────── */
  const handleStatusChange = async (id, status) => {
    setStatusUpdating(id);
    try {
      const r = await api.patch(`/admin/giveaways/${id}/status`, { status });
      setGiveaways((prev) =>
        prev.map((g) => (g._id === id ? { ...g, status: r.data.data.status } : g))
      );
      triggerNotice(`Giveaway status updated to "${status.toUpperCase()}"`);
    } catch (err) {
      triggerNotice(`Error updating status: ${err.response?.data?.message || err.message}`);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleClaimUpdate = async (id, status) => {
    setClaimUpdating(id);
    try {
      const r = await api.patch(`/admin/claims/${id}`, { status });
      setClaims((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: r.data.data.status } : c))
      );
      triggerNotice(`Claim #${id.slice(-6)} marked as ${status.toUpperCase()}`);
    } catch (err) {
      triggerNotice(`Error updating claim: ${err.response?.data?.message || err.message}`);
    } finally {
      setClaimUpdating(null);
    }
  };

  const handleSelectWinner = async () => {
    if (!selectModal) return;
    setSelectLoading(true);
    setSelectMsg('');
    try {
      const r = await api.post('/winners/select', { giveawayId: selectModal._id });
      setSelectMsg(`✓ ${r.data.winnerCount} winner(s) selected successfully.`);
      loadWinners();
      loadGiveaways();
      triggerNotice(`Winner drawn for ${selectModal.title}!`);
    } catch (err) {
      setSelectMsg(err.response?.data?.message || 'Unable to select winner.');
    } finally {
      setSelectLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.prize.trim()) {
      setCreateMsg({ text: 'Title and prize are required fields.', ok: false });
      return;
    }
    setCreateLoading(true);
    setCreateMsg({ text: '', ok: true });
    try {
      const r = await api.post('/giveaways', form);
      setCreateMsg({ text: `✓ "${r.data.data.title}" published successfully.`, ok: true });
      triggerNotice(`Created giveaway "${r.data.data.title}"`);
      setForm(defaultForm);
      loadGiveaways();
    } catch (err) {
      setCreateMsg({ text: err.response?.data?.message || 'Unable to create giveaway.', ok: false });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* ── Filtered Data Calculations ─────────────────────────────────── */
  const filteredGiveaways = useMemo(() => {
    return giveaways.filter((g) => {
      const matchesSearch =
        !giveawaySearch ||
        g.title?.toLowerCase().includes(giveawaySearch.toLowerCase()) ||
        g.giveawayCode?.toLowerCase().includes(giveawaySearch.toLowerCase()) ||
        g.prize?.toLowerCase().includes(giveawaySearch.toLowerCase());

      const matchesStatus =
        giveawayStatusFilter === 'all' ||
        g.status?.toLowerCase() === giveawayStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [giveaways, giveawaySearch, giveawayStatusFilter]);

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const matchesSearch =
        !claimSearch ||
        c.name?.toLowerCase().includes(claimSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(claimSearch.toLowerCase()) ||
        String(c.userId).toLowerCase().includes(claimSearch.toLowerCase());

      const matchesStatus =
        claimStatusFilter === 'all' ||
        c.status?.toLowerCase() === claimStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [claims, claimSearch, claimStatusFilter]);

  /* ── Guard clause ───────────────────────────────────────────────── */
  if (user?.role !== 'admin') {
    return (
      <div className="section">
        <Container>
          <div className="card-glass p-5 text-center mx-auto" style={{ maxWidth: 540 }}>
            <div className="fs-1 mb-3">🔒</div>
            <h3 className="fw-bold mb-2">Admin Access Required</h3>
            <p className="text-white-50 mb-4">
              You must be logged in with an administrator account to access the control center.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/login?redirect=/admin" className="btn btn-primary-custom">
                Log In as Admin
              </Link>
              <Link to="/" className="btn btn-outline-light">
                Return Home
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  /* ── Nav items definition ───────────────────────────────────────── */
  const navItems = [
    { key: 'overview', icon: '⬡', label: 'Overview' },
    { key: 'giveaways', icon: '🎁', label: 'Giveaways', badge: giveaways.length || null },
    { key: 'winners', icon: '🏆', label: 'Winners', badge: winners.length || null },
    { key: 'claims', icon: '📋', label: 'Claims', badge: stats?.pendingClaims > 0 ? stats.pendingClaims : null },
    { key: 'create', icon: '＋', label: 'New Giveaway' },
  ];

  return (
    <div className="admin-shell">
      {/* Mobile Drawer Overlay */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">V</div>
          <div>
            <div className="admin-sidebar__brand-name">VELOOP</div>
            <div className="admin-sidebar__brand-sub">Admin Console</div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-nav-item${tab === item.key ? ' admin-nav-item--active' : ''}`}
              onClick={() => {
                setTab(item.key);
                setSidebarOpen(false);
              }}
            >
              <span className="admin-nav-item__icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="admin-nav-item__badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">{user.name?.[0] || 'A'}</div>
            <div className="overflow-hidden">
              <div className="admin-sidebar__user-name text-truncate">{user.name}</div>
              <div className="admin-sidebar__user-role">Super Admin</div>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-between pt-2">
            <Link to="/" className="admin-sidebar__back">
              ← User Site
            </Link>
            <button
              type="button"
              className="btn btn-link text-danger p-0 text-decoration-none small"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="admin-main">
        {/* Global Toast Notification */}
        {notice && (
          <Alert variant="info" className="mb-4 d-flex align-items-center justify-content-between py-2 px-3 border-0 bg-primary bg-opacity-25 text-white">
            <span>✨ {notice}</span>
            <button type="button" className="btn-close btn-close-white" onClick={() => setNotice('')} />
          </Alert>
        )}

        {/* ════════ OVERVIEW TAB ════════ */}
        {tab === 'overview' && (
          <div className="admin-content-area">
            <div className="admin-page-header">
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="admin-mobile-toggle"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  ☰
                </button>
                <div>
                  <div className="admin-page-eyebrow">Executive Analytics</div>
                  <h2 className="admin-page-title">Platform Overview</h2>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="admin-refresh-btn" onClick={loadStats}>
                  ↻ Refresh
                </button>
                <button
                  type="button"
                  className="btn btn-primary-custom py-2 px-3"
                  style={{ fontSize: '0.88rem' }}
                  onClick={() => setTab('create')}
                >
                  + New Giveaway
                </button>
              </div>
            </div>

            {statsLoading ? (
              <div className="admin-loading">
                <div className="admin-spinner" />
                <span>Synchronizing live metrics…</span>
              </div>
            ) : stats ? (
              <>
                <div className="admin-stats-grid">
                  <StatCard
                    icon="🎁"
                    label="Total Campaigns"
                    value={fmt(stats.totalGiveaways)}
                    trend="All-time"
                    sub="Created campaigns"
                  />
                  <StatCard
                    icon="🟢"
                    label="Active Live"
                    value={fmt(stats.liveGiveaways)}
                    accent
                    trend="Live Now"
                    sub="Accepting entries"
                  />
                  <StatCard
                    icon="👥"
                    label="Verified Entries"
                    value={fmt(stats.totalParticipants)}
                    trend="Participants"
                    sub="Total entries"
                  />
                  <StatCard
                    icon="🏆"
                    label="Winners Awarded"
                    value={fmt(stats.totalWinners)}
                    trend="Selected"
                    sub="RNG audited"
                  />
                  <StatCard
                    icon="📋"
                    label="Pending Claims"
                    value={fmt(stats.pendingClaims)}
                    trend={stats.pendingClaims > 0 ? 'Requires Action' : 'Clear'}
                    sub="Awaiting verification"
                  />
                  <StatCard
                    icon="✅"
                    label="Approved Claims"
                    value={fmt(stats.approvedClaims)}
                    trend="Delivered"
                    sub="Fulfilled rewards"
                  />
                  <StatCard
                    icon="🛡️"
                    label="Fraud Intercepts"
                    value={fmt(stats.fraudEvents)}
                    trend="Last 24h"
                    sub="Device duplicates blocked"
                  />
                </div>

                <div className="admin-overview-cards">
                  {/* Quick Action Matrix */}
                  <div className="admin-info-card">
                    <div className="admin-info-card__title">
                      <span>Quick Controls</span>
                      <small className="text-white-50 fw-normal">Workflow shortcuts</small>
                    </div>
                    <div className="admin-quick-actions">
                      <button
                        type="button"
                        className="admin-quick-btn"
                        onClick={() => setTab('create')}
                      >
                        <span>✨</span>
                        <span>Publish Giveaway</span>
                      </button>
                      <button
                        type="button"
                        className="admin-quick-btn"
                        onClick={() => setTab('claims')}
                      >
                        <span>📝</span>
                        <span>Verify Claims ({stats.pendingClaims})</span>
                      </button>
                      <button
                        type="button"
                        className="admin-quick-btn"
                        onClick={() => setTab('winners')}
                      >
                        <span>🎲</span>
                        <span>Draw Winner</span>
                      </button>
                      <button
                        type="button"
                        className="admin-quick-btn"
                        onClick={() => setTab('giveaways')}
                      >
                        <span>📊</span>
                        <span>Manage Statuses</span>
                      </button>
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="admin-info-card">
                    <div className="admin-info-card__title">
                      <span>Infrastructure Status</span>
                      <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25">
                        Operational
                      </span>
                    </div>
                    <div className="admin-system-status">
                      <div className="admin-status-row">
                        <div className="d-flex align-items-center">
                          <span className="admin-status-dot admin-status-dot--green" />
                          <span>Express REST API</span>
                        </div>
                        <strong className="text-success small">Connected • 200 OK</strong>
                      </div>
                      <div className="admin-status-row">
                        <div className="d-flex align-items-center">
                          <span className="admin-status-dot admin-status-dot--green" />
                          <span>MongoDB Database</span>
                        </div>
                        <strong className="text-success small">Operational</strong>
                      </div>
                      <div className="admin-status-row">
                        <div className="d-flex align-items-center">
                          <span className="admin-status-dot admin-status-dot--green" />
                          <span>Fingerprint Fraud Engine</span>
                        </div>
                        <strong className="text-info small">Active (SHA-256)</strong>
                      </div>
                      <div className="admin-status-row">
                        <div className="d-flex align-items-center">
                          <span
                            className={`admin-status-dot ${
                              stats.pendingClaims > 0
                                ? 'admin-status-dot--yellow'
                                : 'admin-status-dot--green'
                            }`}
                          />
                          <span>Prize Fulfilment Queue</span>
                        </div>
                        <strong
                          className={stats.pendingClaims > 0 ? 'text-warning small' : 'text-success small'}
                        >
                          {stats.pendingClaims > 0
                            ? `${stats.pendingClaims} pending review`
                            : 'All clear'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Giveaways Preview */}
                <div className="admin-info-card">
                  <div className="admin-info-card__title">
                    <span>Recent Campaigns</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-white-50 text-decoration-none p-0"
                      onClick={() => setTab('giveaways')}
                    >
                      View All ({giveaways.length}) →
                    </button>
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Campaign</th>
                          <th>Prize</th>
                          <th>Status</th>
                          <th>Participants</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {giveaways.slice(0, 4).map((g) => (
                          <tr key={g._id}>
                            <td>
                              <div className="fw-bold">{g.title}</div>
                              <div className="admin-table-sub">{g.type}</div>
                            </td>
                            <td>{g.prize}</td>
                            <td>
                              <Badge bg={statusColor(g.status)} className="badge-pill">
                                {g.status?.toUpperCase()}
                              </Badge>
                            </td>
                            <td>{fmt(g.participantCount)} entries</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-light"
                                onClick={() => setTab('giveaways')}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <Alert variant="danger">Failed to load platform analytics.</Alert>
            )}
          </div>
        )}

        {/* ════════ GIVEAWAYS TAB ════════ */}
        {tab === 'giveaways' && (
          <div className="admin-content-area">
            <div className="admin-page-header">
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="admin-mobile-toggle"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  ☰
                </button>
                <div>
                  <div className="admin-page-eyebrow">Campaign Center</div>
                  <h2 className="admin-page-title">Giveaway Management</h2>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="admin-refresh-btn" onClick={loadGiveaways}>
                  ↻ Refresh
                </button>
                <button
                  type="button"
                  className="btn btn-primary-custom py-2 px-3"
                  style={{ fontSize: '0.88rem' }}
                  onClick={() => setTab('create')}
                >
                  + New Giveaway
                </button>
              </div>
            </div>

            {/* Toolbar: Search + Status Filter Pills */}
            <div className="admin-toolbar">
              <input
                type="text"
                className="admin-search-input"
                placeholder="🔍 Search by title, code or prize…"
                value={giveawaySearch}
                onChange={(e) => setGiveawaySearch(e.target.value)}
              />

              <div className="admin-filter-pills">
                {['all', 'live', 'upcoming', 'ending-soon', 'closed', 'draft'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`admin-pill-btn ${giveawayStatusFilter === s ? 'admin-pill-btn--active' : ''}`}
                    onClick={() => setGiveawayStatusFilter(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {giveawaysLoading ? (
              <div className="admin-loading">
                <div className="admin-spinner" />
                <span>Loading campaigns…</span>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Title & Type</th>
                      <th>Prize</th>
                      <th>Status</th>
                      <th>Participants</th>
                      <th>Status Control</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGiveaways.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-5">
                          No giveaways match the selected criteria.
                        </td>
                      </tr>
                    )}
                    {filteredGiveaways.map((g) => {
                      const isClosed = ['closed', 'archived', 'ended'].includes(
                        g.status?.toLowerCase() || ''
                      );
                      return (
                        <tr key={g._id}>
                          <td>
                            <span className="admin-code">{g.giveawayCode || '—'}</span>
                          </td>
                          <td>
                            <div className="fw-bold text-white">{g.title}</div>
                            <div className="admin-table-sub">
                              <span className="badge bg-secondary bg-opacity-25 text-white-50 me-1">
                                {g.type}
                              </span>
                              {g.slug && <span className="text-white-50">/{g.slug}</span>}
                            </div>
                          </td>
                          <td>
                            <span className="fw-semibold text-gradient">{g.prize}</span>
                          </td>
                          <td>
                            <Badge bg={statusColor(g.status)} className="badge-pill">
                              {g.status?.toUpperCase()}
                            </Badge>
                          </td>
                          <td>
                            <div className="fw-bold">{fmt(g.participantCount)}</div>
                            <div className="admin-table-sub">verified entries</div>
                          </td>
                          <td>
                            <Form.Select
                              className="admin-select"
                              value={g.status}
                              disabled={statusUpdating === g._id}
                              onChange={(e) => handleStatusChange(g._id, e.target.value)}
                            >
                              <option value="draft">Draft</option>
                              <option value="upcoming">Upcoming</option>
                              <option value="live">Live</option>
                              <option value="ending-soon">Ending Soon</option>
                              <option value="closed">Closed</option>
                              <option value="ARCHIVED">Archived</option>
                            </Form.Select>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {isClosed ? (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-warning text-nowrap"
                                  onClick={() => {
                                    setSelectModal(g);
                                    setSelectMsg('');
                                    setTab('winners');
                                  }}
                                >
                                  🏆 Draw
                                </button>
                              ) : (
                                <Link
                                  to={`/giveaway/${g.slug || g._id}`}
                                  className="btn btn-sm btn-outline-light text-nowrap"
                                  target="_blank"
                                >
                                  Preview ↗
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════ WINNERS TAB ════════ */}
        {tab === 'winners' && (
          <div className="admin-content-area">
            <div className="admin-page-header">
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="admin-mobile-toggle"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  ☰
                </button>
                <div>
                  <div className="admin-page-eyebrow">RNG Selection</div>
                  <h2 className="admin-page-title">Winners Hall & Drawing</h2>
                </div>
              </div>
              <button type="button" className="admin-refresh-btn" onClick={loadWinners}>
                ↻ Refresh
              </button>
            </div>

            {/* Select Winner Trigger Section */}
            <div className="admin-info-card mb-4">
              <div className="admin-info-card__title">
                <span>Draw Random Verified Winner</span>
                <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25">
                  Audit Logged
                </span>
              </div>
              <p className="text-white-50 mb-3" style={{ fontSize: '0.9rem' }}>
                Select any <strong>Closed</strong> campaign below to run the cryptographic random winner selection algorithm against all verified participants:
              </p>

              <div className="d-flex flex-wrap gap-2">
                {giveaways
                  .filter((g) => ['closed', 'archived', 'ended'].includes(g.status?.toLowerCase() || ''))
                  .map((g) => (
                    <button
                      key={g._id}
                      type="button"
                      className="admin-quick-btn"
                      onClick={() => {
                        setSelectModal(g);
                        setSelectMsg('');
                      }}
                    >
                      🏆 <span>{g.title}</span>
                      <small className="text-white-50 ms-1">({fmt(g.participantCount)} entries)</small>
                    </button>
                  ))}

                {giveaways.filter((g) =>
                  ['closed', 'archived', 'ended'].includes(g.status?.toLowerCase() || '')
                ).length === 0 && (
                  <div className="p-3 bg-white bg-opacity-5 rounded-3 w-100 text-white-50 small">
                    ℹ️ No closed campaigns available. Go to the <strong>Giveaways</strong> tab and change a campaign's status to <strong>Closed</strong> first.
                  </div>
                )}
              </div>
            </div>

            {winnersLoading ? (
              <div className="admin-loading">
                <div className="admin-spinner" />
                <span>Loading winning records…</span>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Winner ID</th>
                      <th>Campaign ID</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Selected Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-5">
                          No winners selected yet.
                        </td>
                      </tr>
                    )}
                    {winners.map((w) => (
                      <tr key={w._id}>
                        <td>
                          <span className="admin-code">{String(w.userId).slice(0, 18)}…</span>
                        </td>
                        <td>
                          <span className="admin-code">#{String(w.giveawayId).slice(-8)}</span>
                        </td>
                        <td>
                          <span className="badge bg-dark border border-secondary border-opacity-50 text-white-50">
                            {w.selectionMethod || 'Cryptographic RNG'}
                          </span>
                        </td>
                        <td>
                          <Badge
                            bg={
                              w.status === 'claimed'
                                ? 'success'
                                : w.status === 'expired'
                                ? 'danger'
                                : 'primary'
                            }
                            className="badge-pill"
                          >
                            {w.status?.toUpperCase() || 'AWARDED'}
                          </Badge>
                        </td>
                        <td>{w.selectedAt ? new Date(w.selectedAt).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════ CLAIMS TAB ════════ */}
        {tab === 'claims' && (
          <div className="admin-content-area">
            <div className="admin-page-header">
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="admin-mobile-toggle"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  ☰
                </button>
                <div>
                  <div className="admin-page-eyebrow">Prize Fulfilment</div>
                  <h2 className="admin-page-title">Prize Claims Queue</h2>
                </div>
              </div>
              <button type="button" className="admin-refresh-btn" onClick={loadClaims}>
                ↻ Refresh
              </button>
            </div>

            {/* Filter toolbar */}
            <div className="admin-toolbar">
              <input
                type="text"
                className="admin-search-input"
                placeholder="🔍 Search by name, email or user ID…"
                value={claimSearch}
                onChange={(e) => setClaimSearch(e.target.value)}
              />

              <div className="admin-filter-pills">
                {['all', 'pending', 'approved', 'rejected'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`admin-pill-btn ${claimStatusFilter === s ? 'admin-pill-btn--active' : ''}`}
                    onClick={() => setClaimStatusFilter(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {claimsLoading ? (
              <div className="admin-loading">
                <div className="admin-spinner" />
                <span>Loading claims queue…</span>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Recipient / Contact</th>
                      <th>Reward Type</th>
                      <th>Claim Details</th>
                      <th>Status</th>
                      <th>Submitted Date</th>
                      <th>Verification Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-5">
                          No claims found in this queue.
                        </td>
                      </tr>
                    )}
                    {filteredClaims.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <div className="fw-bold">{c.name || 'Anonymous User'}</div>
                          <div className="admin-table-sub">{c.email || 'No email specified'}</div>
                          {c.phone && <div className="admin-table-sub">📞 {c.phone}</div>}
                        </td>
                        <td>
                          <Badge
                            bg={c.type === 'gift-card' ? 'primary' : 'secondary'}
                            className="badge-pill"
                          >
                            {c.type || 'standard'}
                          </Badge>
                        </td>
                        <td>
                          <span className="admin-code">User: {String(c.userId).slice(0, 12)}…</span>
                        </td>
                        <td>
                          <Badge bg={claimColor(c.status)} className="badge-pill">
                            {c.status?.toUpperCase()}
                          </Badge>
                        </td>
                        <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                        <td>
                          {c.status === 'pending' ? (
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--approve"
                                disabled={claimUpdating === c._id}
                                onClick={() => handleClaimUpdate(c._id, 'approved')}
                              >
                                {claimUpdating === c._id ? '…' : '✓ Approve'}
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--reject"
                                disabled={claimUpdating === c._id}
                                onClick={() => handleClaimUpdate(c._id, 'rejected')}
                              >
                                {claimUpdating === c._id ? '…' : '✕ Reject'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-white-50 small">
                              {c.status === 'approved' ? '✓ Verified & Fulfilled' : '✕ Dismissed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════ CREATE GIVEAWAY TAB ════════ */}
        {tab === 'create' && (
          <div className="admin-content-area">
            <div className="admin-page-header">
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="admin-mobile-toggle"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  ☰
                </button>
                <div>
                  <div className="admin-page-eyebrow">Campaign Designer</div>
                  <h2 className="admin-page-title">Create New Giveaway</h2>
                </div>
              </div>
            </div>

            <Row className="g-4">
              <Col lg={7}>
                <div className="card-glass p-4">
                  <Form onSubmit={handleCreate}>
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="text-white-50 small fw-bold">
                            CAMPAIGN TITLE *
                          </Form.Label>
                          <Form.Control
                            size="lg"
                            className="bg-dark text-white border-secondary border-opacity-50"
                            placeholder="e.g. PlayStation 5 Pro & OLED Setup"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="text-white-50 small fw-bold">
                            PRIZE HEADLINE *
                          </Form.Label>
                          <Form.Control
                            className="bg-dark text-white border-secondary border-opacity-50"
                            placeholder="e.g. Sony PS5 Pro + 4K OLED TV"
                            value={form.prize}
                            onChange={(e) => setForm({ ...form, prize: e.target.value })}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="text-white-50 small fw-bold">TYPE</Form.Label>
                          <Form.Select
                            className="bg-dark text-white border-secondary border-opacity-50"
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                          >
                            <option value="Instant Win">Instant Win</option>
                            <option value="Reward Bundle">Reward Bundle</option>
                            <option value="Lucky Draw">Lucky Draw</option>
                            <option value="Community Drop">Community Drop</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="text-white-50 small fw-bold">
                            INITIAL STATUS
                          </Form.Label>
                          <Form.Select
                            className="bg-dark text-white border-secondary border-opacity-50"
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                          >
                            <option value="draft">Draft (Private)</option>
                            <option value="upcoming">Upcoming (Teaser)</option>
                            <option value="live">Live (Open for Entries)</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="text-white-50 small fw-bold">
                            BANNER IMAGE URL (OPTIONAL)
                          </Form.Label>
                          <Form.Control
                            className="bg-dark text-white border-secondary border-opacity-50"
                            placeholder="https://images.unsplash.com/..."
                            value={form.imageUrl}
                            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="text-white-50 small fw-bold">
                            CAMPAIGN DESCRIPTION
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            className="bg-dark text-white border-secondary border-opacity-50"
                            placeholder="Provide full details, eligibility rules, and instructions for participants…"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {createMsg.text && (
                      <Alert
                        variant={createMsg.ok ? 'success' : 'danger'}
                        className="mt-3 mb-0 py-2"
                      >
                        {createMsg.text}
                      </Alert>
                    )}

                    <div className="d-flex gap-3 mt-4">
                      <Button
                        type="submit"
                        className="btn-primary-custom px-4"
                        disabled={createLoading}
                      >
                        {createLoading ? 'Publishing…' : 'Publish Campaign'}
                      </Button>
                      <Button
                        variant="outline-light"
                        type="button"
                        onClick={() => setForm(defaultForm)}
                      >
                        Reset
                      </Button>
                    </div>
                  </Form>
                </div>
              </Col>

              {/* Live Preview Column */}
              <Col lg={5}>
                <div className="admin-preview-box">
                  <div className="admin-preview-header">
                    <span>👁️ Live Card Preview</span>
                    <span className="badge bg-success bg-opacity-25 text-success">
                      Real-time sync
                    </span>
                  </div>

                  <div className="card-glass p-4 border border-primary border-opacity-25">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className="badge-pill bg-primary text-white">
                        {form.type || 'Instant Win'}
                      </span>
                      <Badge bg={statusColor(form.status)} className="badge-pill">
                        {form.status.toUpperCase()}
                      </Badge>
                    </div>

                    <h4 className="fw-bold mb-2 text-white">
                      {form.title.trim() || 'Your Giveaway Title'}
                    </h4>

                    <div className="text-gradient fw-bold fs-5 mb-3">
                      🎁 {form.prize.trim() || 'Prize Headline'}
                    </div>

                    <p className="text-white-50 small mb-4" style={{ minHeight: '40px' }}>
                      {form.description.trim() ||
                        'Description and entry conditions will appear here for participants.'}
                    </p>

                    <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25">
                      <span className="small text-white-50">0 Participants</span>
                      <button type="button" className="btn btn-sm btn-primary-custom" disabled>
                        Join Giveaway
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="admin-info-card__title mb-2" style={{ fontSize: '0.9rem' }}>
                      Publishing Guidelines
                    </div>
                    <ul className="admin-tips-list">
                      <li>
                        Set to <strong>Draft</strong> if you want to configure or verify before making it visible.
                      </li>
                      <li>
                        Set to <strong>Live</strong> so verified users can immediately submit entries.
                      </li>
                      <li>
                        When expired, switch to <strong>Closed</strong> to trigger the random winner drawing.
                      </li>
                    </ul>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </main>

      {/* ════════ SELECT WINNER CONFIRMATION MODAL ════════ */}
      <Modal
        show={!!selectModal}
        onHide={() => {
          setSelectModal(null);
          setSelectMsg('');
        }}
        centered
        contentClassName="bg-dark text-white border border-secondary border-opacity-25 shadow-lg"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="fw-bold">🎲 Cryptographic Winner Selection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-white-50 mb-3">
            You are about to randomly draw a winner for <strong>{selectModal?.title}</strong> from all verified participants.
          </p>

          <div className="p-3 bg-secondary bg-opacity-10 rounded-3 mb-3 small">
            <div><strong>Prize:</strong> {selectModal?.prize}</div>
            <div><strong>Total Pool:</strong> {fmt(selectModal?.participantCount)} participants</div>
            <div><strong>Integrity Check:</strong> Device fingerprint uniqueness verified</div>
          </div>

          {selectMsg && (
            <Alert variant={selectMsg.startsWith('✓') ? 'success' : 'danger'}>
              {selectMsg}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-light"
            onClick={() => {
              setSelectModal(null);
              setSelectMsg('');
            }}
          >
            Cancel
          </Button>
          <Button
            className="btn-primary-custom"
            onClick={handleSelectWinner}
            disabled={selectLoading || selectMsg.startsWith('✓')}
          >
            {selectLoading ? 'Drawing Winner…' : 'Confirm & Execute Draw'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminPanel;
