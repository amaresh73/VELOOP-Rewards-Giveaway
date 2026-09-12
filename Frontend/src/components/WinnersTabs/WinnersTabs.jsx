import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Badge, Modal, Form, Alert, Row, Col } from 'react-bootstrap';

const claimStateConfig = {
  'Not Submitted': { label: 'Claim Prize', variant: 'btn-primary-custom', canClaim: true },
  'Submitted': { label: 'Claim Submitted ✓', variant: 'btn-outline-success', canClaim: false },
  'Processing': { label: 'Prize Verification In Progress', variant: 'btn-outline-warning', canClaim: false },
  'Completed': { label: 'Prize Delivered ✓', variant: 'btn-outline-success', canClaim: false },
  'Expired': { label: 'Claim Window Expired', variant: 'btn-outline-danger', canClaim: false }
};

const defaultClaimForm = { fullName: '', phone: '', address: '', city: '', state: '', pin: '', email: '' };

function WinnersTabs({
  activeGiveaway = null,
  winners = [],
  previousHistory = [],
  currentUserId = 'guest',
  onClaimSubmit,
  isLoggedIn = false
}) {
  const [activeTab, setActiveTab] = useState('current');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState(defaultClaimForm);
  const [claimStatus, setClaimStatus] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [revealState, setRevealState] = useState('revealed'); // 'idle' | 'selecting' | 'revealed'
  const [demoStateOverride, setDemoStateOverride] = useState(null); // null | 'live' | 'ended'

  // Detect if current user is a winner
  const myWinnerRecord = winners.find(
    (w) => String(w.userId || w.user_id || '') === String(currentUserId)
  ) || null;

  const baseIsGiveawayLive = activeGiveaway
    ? ['active', 'live', 'ACTIVE', 'LIVE', 'ending-soon'].includes(String(activeGiveaway.status || ''))
    : true;

  const isGiveawayLive = demoStateOverride !== null ? demoStateOverride === 'live' : baseIsGiveawayLive;

  const handleSimulateReveal = () => {
    setRevealState('selecting');
    setTimeout(() => {
      setRevealState('revealed');
    }, 1600);
  };

  const handleOpenClaim = (winner) => {
    setSelectedWinner(winner);
    setClaimStatus('');
    setClaimForm(defaultClaimForm);
    setShowClaimModal(true);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWinner) return;
    setClaimLoading(true);
    try {
      if (onClaimSubmit) {
        await onClaimSubmit({ winner: selectedWinner, form: claimForm });
      }
      setClaimStatus('success');
    } catch (err) {
      setClaimStatus('error:' + (err?.message || 'Unable to submit claim.'));
    } finally {
      setClaimLoading(false);
    }
  };

  const isGiftCard = selectedWinner?.prizeType === 'GIFT_CARD' || selectedWinner?.prizeType === 'gift-card';
  const isDigital = selectedWinner?.prizeType === 'DIGITAL' || selectedWinner?.prizeType === 'digital';

  return (
    <div>
      {/* Tabs */}
      <div className="wtabs__header">
        <button
          type="button"
          id="tab-current"
          role="tab"
          aria-selected={activeTab === 'current'}
          aria-controls="tabpanel-current"
          className={`wtabs__tab${activeTab === 'current' ? ' wtabs__tab--active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current Giveaway
        </button>
        <button
          type="button"
          id="tab-previous"
          role="tab"
          aria-selected={activeTab === 'previous'}
          aria-controls="tabpanel-previous"
          className={`wtabs__tab${activeTab === 'previous' ? ' wtabs__tab--active' : ''}`}
          onClick={() => setActiveTab('previous')}
        >
          Previous Winners
        </button>
      </div>

      {/* Current Giveaway Tab */}
      {activeTab === 'current' && (
        <div id="tabpanel-current" role="tabpanel" aria-labelledby="tab-current" className="wtabs__panel">

          {/* Status Banner */}
          <div className="wtabs__status-banner">
            <div className="wtabs__status-row">
              <Badge bg={isGiveawayLive ? 'success' : 'secondary'} className="badge-pill">
                {isGiveawayLive ? '● LIVE' : '● ENDED'}
              </Badge>
              <span className="wtabs__giveaway-name">
                {activeGiveaway?.title || 'Summer Elite Drop'}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-light rounded-pill py-0 px-2 ms-auto small"
                style={{ fontSize: '0.72rem' }}
                onClick={() => {
                  const next = isGiveawayLive ? 'ended' : 'live';
                  setDemoStateOverride(next);
                  if (next === 'ended') handleSimulateReveal();
                }}
              >
                Toggle {isGiveawayLive ? 'Ended State' : 'Live State'} (Demo)
              </button>
            </div>
            {isGiveawayLive ? (
              <p className="wtabs__status-text">
                Winners will be announced after the giveaway ends. Keep participating!
              </p>
            ) : (
              <p className="wtabs__status-text">
                The giveaway has ended. Winner selection is complete.
              </p>
            )}
          </div>

          {/* Giveaway Info Cards */}
          <Row className="g-3 mb-4">
            <Col md={6}>
              <div className="mini-stat h-100">
                <div className="text-uppercase text-primary small mb-2">Current Giveaway</div>
                <div className="fw-bold fs-5 mb-2">{activeGiveaway?.title || 'Summer Elite Drop'}</div>
                <div className="text-white-50 mb-1">
                  Status: <strong>{isGiveawayLive ? 'LIVE' : 'ENDED'}</strong>
                </div>
                <div className="text-white-50 small">
                  {isGiveawayLive
                    ? 'Winner announcement: Coming after the giveaway ends.'
                    : 'Winner selection has been finalized.'}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mini-stat h-100">
                <div className="text-uppercase text-primary small mb-2">Participants</div>
                <div className="fw-bold fs-3 mb-1">
                  {Number(activeGiveaway?.participants || 0).toLocaleString()}+
                </div>
                <div className="text-white-50 small">Verified entries in this giveaway</div>
              </div>
            </Col>
          </Row>

          {/* Winner Reveal Animation (Requirement 47) */}
          {!isGiveawayLive && revealState === 'selecting' && (
            <div className="card-glass p-5 text-center my-4 border border-primary border-opacity-50">
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }} />
              <h4 className="fw-bold mb-2">Selecting Winners...</h4>
              <p className="text-white-50 small mb-0">
                Auditing verified participant entries &amp; executing verifiable draw algorithm.
              </p>
            </div>
          )}

          {!isGiveawayLive && revealState === 'revealed' && (
            <div className="winner-reveal-banner mb-4 p-3 rounded-3" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: '2rem' }}>🎉</span>
                  <div>
                    <div className="text-uppercase text-purple small fw-bold">Winner Revealed</div>
                    <h5 className="fw-bold mb-0">1st Prize Winner — iPhone 15 Pro (VE****82)</h5>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light rounded-pill px-3"
                  onClick={handleSimulateReveal}
                >
                  ↺ Replay Reveal
                </button>
              </div>
            </div>
          )}

          {/* Winner State — only show if giveaway is NOT live and revealState is revealed */}
          {!isGiveawayLive && revealState === 'revealed' && winners.length > 0 && (
            <div className="wtabs__winners-list">
              <h5 className="fw-bold mb-3">🏆 Winners</h5>
              {winners.map((w, i) => {
                const maskedId = String(w.userId || '').slice(0, 2) + '****' + String(w.userId || '').slice(-2);
                const isMe = String(w.userId || '') === String(currentUserId);
                return (
                  <div key={`winner-${i}`} className={`wtabs__winner-row${isMe ? ' wtabs__winner-row--me' : ''}`}>
                    <div className="wtabs__winner-avatar" aria-hidden="true">
                      {maskedId.charAt(0)}
                    </div>
                    <div className="wtabs__winner-info">
                      <div className="fw-bold">{isMe ? '🎉 You!' : maskedId}</div>
                      <div className="small text-white-50">{w.prize || 'Prize Winner'}</div>
                    </div>
                    {isMe && (
                      <button
                        type="button"
                        className="btn-primary-custom"
                        onClick={() => handleOpenClaim(w)}
                      >
                        Claim Prize
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Congratulations for the current logged-in winner */}
          {myWinnerRecord && (
            <div className="wtabs__congrats">
              <div className="wtabs__congrats-icon" aria-hidden="true">🎉</div>
              <div>
                <div className="text-uppercase text-success small fw-bold mb-1">Congratulations!</div>
                <h4 className="fw-bold mb-2">You won {myWinnerRecord.prize}!</h4>
                <div className="text-white-50 small mb-3">
                  Giveaway: {myWinnerRecord.giveaway || activeGiveaway?.title} ·
                  Status: {myWinnerRecord.claimState || 'Winner'} ·
                  Claim within: 7 days
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {(() => {
                    const cfg = claimStateConfig[myWinnerRecord.claimState || 'Not Submitted'];
                    return cfg?.canClaim ? (
                      <button
                        type="button"
                        className={cfg.variant}
                        onClick={() => handleOpenClaim(myWinnerRecord)}
                      >
                        {cfg.label}
                      </button>
                    ) : (
                      <span className={`btn ${cfg.variant} disabled`}>{cfg.label}</span>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Non-winner state (logged in but not a winner, giveaway ended) */}
          {!isGiveawayLive && !myWinnerRecord && isLoggedIn && (
            <div className="wtabs__non-winner">
              <div className="wtabs__non-winner-icon" aria-hidden="true">🎯</div>
              <div>
                <h5 className="fw-bold mb-2">Thanks for participating!</h5>
                <p className="text-white-50 mb-2">
                  Winners have been announced. Better luck next time!
                </p>
                <div className="d-flex gap-2 flex-wrap mt-3">
                  <a href="#tabpanel-current" className="btn btn-outline-success rounded-pill px-3">
                    View Winners
                  </a>
                  <Link to="/" className="btn btn-outline-light rounded-pill px-3">
                    Explore Next Giveaway →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Live giveaway — no winner shown yet */}
          {isGiveawayLive && (
            <div className="wtabs__live-notice">
              <div className="wtabs__live-notice-icon" aria-hidden="true">⏳</div>
              <div>
                <h5 className="fw-bold mb-1">Giveaway is still live</h5>
                <p className="text-white-50 mb-0">
                  Winners have not yet been finalized. Winner announcement will appear here
                  after the giveaway ends.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Previous Winners Tab */}
      {activeTab === 'previous' && (
        <div id="tabpanel-previous" role="tabpanel" aria-labelledby="tab-previous" className="wtabs__panel">
          <div className="mb-4">
            <h3 className="fw-bold mb-2">Previous Winners</h3>
            <p className="text-white-50 mb-0">
              Completed giveaways and their verified prize recipients.
            </p>
          </div>

          {previousHistory.length > 0 ? (
            <Row className="g-3">
              {previousHistory.map((history, i) => {
                // If it's a flat record
                if (history.userId || history.name) {
                  const maskedId = history.name || (String(history.userId || '').slice(0, 2) + '****' + String(history.userId || '').slice(-2));
                  return (
                    <Col md={6} lg={4} key={`history-${i}`}>
                      <div className="prev-winner-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-uppercase text-primary small fw-bold">Previous Giveaway</span>
                          <Badge bg="success" className="badge-pill">Completed ✓</Badge>
                        </div>
                        <h5 className="fw-bold mb-3">{history.giveaway}</h5>
                        <div className="prev-winner-card__row mb-2">
                          <div className="prev-winner-card__avatar">{maskedId.charAt(0)}</div>
                          <div>
                            <div className="fw-bold small">{maskedId}</div>
                            <div className="text-white-50 small">Won: {history.prize}</div>
                          </div>
                        </div>
                        <div className="text-white-50 small mt-2">
                          <strong>Date:</strong> {history.date || '05 Aug 2026'}
                        </div>
                      </div>
                    </Col>
                  );
                }

                // If it's a grouped record from API
                const giveawayName = history.giveaway?.title || history.giveaway || 'Past Giveaway';
                const winnersArr = Array.isArray(history.winners) ? history.winners : [];
                return (
                  <Col md={6} lg={4} key={`history-${i}`}>
                    <div className="prev-winner-card h-100">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-uppercase text-primary small fw-bold">Previous Giveaway</span>
                        <Badge bg="success" className="badge-pill">Completed ✓</Badge>
                      </div>
                      <h5 className="fw-bold mb-1">{giveawayName}</h5>
                      <div className="prev-winner-card__code text-white-50 small mb-3">
                        {history.giveaway?.giveawayCode || 'GW-COMPLETED'}
                      </div>
                      {winnersArr.length > 0 ? winnersArr.map((w, wi) => {
                        const maskedId = String(w.userId || '').slice(0, 2) + '****' + String(w.userId || '').slice(-2);
                        return (
                          <div key={`pw-${wi}`} className="prev-winner-card__row">
                            <div className="prev-winner-card__avatar">{maskedId.charAt(0)}</div>
                            <div>
                              <div className="fw-bold small">{maskedId}</div>
                              <div className="text-white-50 small">Won: {w.prize || history.giveaway?.prize}</div>
                            </div>
                            <span className="prev-winner-card__status">✓</span>
                          </div>
                        );
                      }) : (
                        <div className="text-white-50 small">{winnersArr.length} verified winner(s)</div>
                      )}
                      <div className="text-white-50 small mt-2">
                        <strong>Date:</strong> {history.giveaway?.endDate ? new Date(history.giveaway.endDate).toLocaleDateString() : '05 Aug 2026'}
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <div className="wtabs__empty">
              <div className="wtabs__empty-icon" aria-hidden="true">📋</div>
              <h5 className="fw-bold mb-2">No Previous Winners Yet</h5>
              <p className="text-white-50 mb-0">
                Previous winners will appear here after a giveaway is completed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Prize Claim Modal */}
      <Modal show={showClaimModal} onHide={() => setShowClaimModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: 'rgba(17,24,39,0.98)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <Modal.Title>
            {isGiftCard ? '🎁 Claim Gift Card' : isDigital ? '💎 Claim Digital Reward' : '🏆 Claim Your Prize'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'rgba(17,24,39,0.98)' }}>
          {claimStatus === 'success' ? (
            <div className="text-center p-4">
              <div className="claim-success-icon" aria-hidden="true">✓</div>
              <h4 className="fw-bold mt-3 mb-2">Claim Submitted!</h4>
              <p className="text-white-50 mb-0">Our team will process your prize and reach out with next steps.</p>
            </div>
          ) : (
            <>
              <div className="claim-modal-header mb-4">
                <div className="text-uppercase text-success small fw-bold mb-1">Winner ✓</div>
                <h4 className="fw-bold mb-1">You won {selectedWinner?.prize || 'your prize'}!</h4>
                <div className="text-white-50 small mb-1">Prize: {selectedWinner?.prize}</div>
                <div className="text-white-50 small mb-1">Giveaway: {selectedWinner?.giveaway}</div>
                <div className="text-white-50 small mb-1">Status: Winner ✓</div>
                <div className="text-white-50 small">Claim within: 7 days</div>
              </div>

              <Form onSubmit={handleClaimSubmit}>
                {isGiftCard ? (
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email where you want to receive your gift card"
                      value={claimForm.email}
                      onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                      required
                    />
                    <Form.Text className="text-white-50">
                      Your gift card will be delivered to this email address.
                    </Form.Text>
                  </Form.Group>
                ) : isDigital ? (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Wallet / Account ID</Form.Label>
                      <Form.Control
                        placeholder="Enter destination wallet or digital account address"
                        value={claimForm.address}
                        onChange={(e) => setClaimForm({ ...claimForm, address: e.target.value })}
                        required
                      />
                      <Form.Text className="text-white-50">
                        Digital reward will be transferred to this verified address.
                      </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirmation Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your confirmation email address"
                        value={claimForm.email}
                        onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </>
                ) : (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        value={claimForm.fullName}
                        onChange={(e) => setClaimForm({ ...claimForm, fullName: e.target.value })}
                        placeholder="As it appears on government ID"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        value={claimForm.phone}
                        onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Complete Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={claimForm.address}
                        onChange={(e) => setClaimForm({ ...claimForm, address: e.target.value })}
                        placeholder="House/Flat number, Street, Area"
                        required
                      />
                    </Form.Group>
                    <Row className="g-3">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>City</Form.Label>
                          <Form.Control
                            value={claimForm.city}
                            onChange={(e) => setClaimForm({ ...claimForm, city: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>State</Form.Label>
                          <Form.Control
                            value={claimForm.state}
                            onChange={(e) => setClaimForm({ ...claimForm, state: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>PIN Code</Form.Label>
                          <Form.Control
                            value={claimForm.pin}
                            onChange={(e) => setClaimForm({ ...claimForm, pin: e.target.value })}
                            required
                            maxLength={6}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {claimStatus && claimStatus !== 'success' && (
                  <Alert variant="danger" className="mt-3 mb-0">
                    {claimStatus.replace('error:', '')}
                  </Alert>
                )}

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="outline-light" onClick={() => setShowClaimModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-primary-custom" disabled={claimLoading}>
                    {claimLoading ? 'Submitting...' : 'Submit Claim'}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default WinnersTabs;
