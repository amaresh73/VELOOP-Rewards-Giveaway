import { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Modal, Badge } from 'react-bootstrap';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GiveawayCodeModal from '../components/Common/GiveawayCodeModal';
import api from '../services/api';

function ProfilePage() {
  const { user, setUser, isLoggedIn, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Redeem code & Withdraw modal states
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawType, setWithdrawType] = useState('PHYSICAL_GIFT');
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [withdrawData, setWithdrawData] = useState({
    currency: 'VEs',
    amount: '500',
    giftItem: 'VELOOP VIP Tech Hamper & Merch Box',
    payoutMethod: 'UPI',
    destination: '',
    recipientName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pin: ''
  });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // Route protection
  if (!isLoggedIn) {
    return <Navigate to="/login?redirect=/profile" replace state={{ message: 'Please log in to view your profile.' }} />;
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirm new password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await changePassword({ currentPassword, newPassword, confirmNewPassword });
      setPasswordSuccess(response.message || 'Password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password. Please check your current password.';
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const confirmAccountDeletion = async (e) => {
    if (e) e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      navigate('/login', {
        state: {
          registered: false,
          message: 'Your account has been permanently deleted. We are sorry to see you go.'
        }
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete account. Please try again.';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const balances = user?.balances || { VEs: 0, SVEs: 0, Tokens: 0 };

  return (
    <div className="section py-4">
      <Container className="container-shell" style={{ maxWidth: 900 }}>
        {/* Navigation / Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <Link to="/" className="btn btn-outline-light rounded-pill px-3 py-2 fw-semibold">
            ← Back to Giveaways
          </Link>
          <Badge bg={user?.role === 'admin' ? 'primary' : 'secondary'} className="px-3 py-2 fs-6">
            {user?.role === 'admin' ? '🛡️ Administrator' : '👤 Verified Member'}
          </Badge>
        </div>

        <Row className="g-4">
          {/* Left Column: Profile Details & Balances */}
          <Col lg={5}>
            <div className="card-glass p-4 rounded mb-4">
              <div className="text-center mb-4">
                <div
                  className="rounded-circle bg-primary bg-opacity-25 border border-primary border-opacity-50 d-flex align-items-center justify-content-center text-primary fw-bold mx-auto mb-3"
                  style={{ width: 80, height: 80, fontSize: '2.2rem' }}
                >
                  {user?.name ? user.name[0].toUpperCase() : '👤'}
                </div>
                <h3 className="fw-bold mb-1">{user?.name || 'Member'}</h3>
                <p className="text-white-50 small mb-2">{user?.email || 'No email registered'}</p>
                <Badge bg="success" bg-opacity="25" className="text-success border border-success border-opacity-25">
                  ✓ Account Active
                </Badge>
              </div>

              <hr className="border-secondary border-opacity-25 my-3" />

              {/* Wallet Balances */}
              <h6 className="text-white-50 text-uppercase small fw-bold mb-3">Your Wallet Balances</h6>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center p-2 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                  <span className="text-white-50 small">💎 VEs (Veloop Entries)</span>
                  <span className="fw-bold text-white fs-6">{Number(balances.VEs || 0).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-2 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                  <span className="text-white-50 small">⚡ SVEs (Super VEs)</span>
                  <span className="fw-bold text-warning fs-6">{Number(balances.SVEs || 0).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-2 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                  <span className="text-white-50 small">🪙 Tokens</span>
                  <span className="fw-bold text-info fs-6">{Number(balances.Tokens || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Wallet Actions */}
              <div className="d-flex gap-2 mt-3 flex-wrap">
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="rounded-pill px-3 fw-semibold flex-fill d-flex align-items-center justify-content-center gap-1"
                  onClick={() => setShowCodeModal(true)}
                >
                  <span>🎁</span> Redeem Code
                </Button>
                <Button
                  className="btn-primary-custom rounded-pill px-3 fw-semibold flex-fill d-flex align-items-center justify-content-center gap-1"
                  size="sm"
                  onClick={() => {
                    setWithdrawSuccess('');
                    setWithdrawError('');
                    setOrderReceipt(null);
                    setWithdrawData((prev) => ({
                      ...prev,
                      recipientName: user?.name || prev.recipientName || '',
                      phone: user?.phone || prev.phone || ''
                    }));
                    setShowWithdrawModal(true);
                  }}
                >
                  <span>🎁</span> Withdraw Gifts & Cash
                </Button>
              </div>
            </div>
          </Col>

          {/* Right Column: Password Change & Danger Zone */}
          <Col lg={7}>
            {/* Password Change Card */}
            <div className="card-glass p-4 rounded mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="fs-4">🔑</span>
                <div>
                  <h4 className="fw-bold mb-0">Change Password</h4>
                  <small className="text-white-50">Update your account login password</small>
                </div>
              </div>

              {passwordSuccess && (
                <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <span>✅</span>
                  <div>{passwordSuccess}</div>
                </Alert>
              )}

              {passwordError && (
                <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <span>⚠️</span>
                  <div>{passwordError}</div>
                </Alert>
              )}

              <Form onSubmit={submitPasswordChange}>
                <Form.Group className="mb-3" controlId="current-password">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    Current Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={passwordLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="new-password">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    placeholder="At least 6 characters"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={passwordLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="confirm-new-password">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    Confirm New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmNewPassword"
                    placeholder="Re-enter new password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={passwordLoading}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-primary-custom w-100 py-2 fw-semibold"
                  disabled={passwordLoading}
                  id="change-password-submit-btn"
                >
                  {passwordLoading ? 'Updating Password...' : 'Save New Password'}
                </Button>
              </Form>
            </div>

            {/* Danger Zone: Account Deletion */}
            <div
              className="card-glass p-4 rounded"
              style={{ border: '1px solid rgba(220, 53, 69, 0.4)', background: 'rgba(220, 53, 69, 0.04)' }}
            >
              <div className="d-flex align-items-center gap-2 mb-2 text-danger">
                <span className="fs-4">⚠️</span>
                <h4 className="fw-bold mb-0">Danger Zone</h4>
              </div>
              <p className="text-white-50 small mb-3">
                Permanently delete your account. Once your account is deleted, your profile, entry tickets, and wallet balances will be permanently destroyed. This action cannot be reversed.
              </p>
              <Button
                variant="outline-danger"
                className="fw-bold w-100 py-2"
                onClick={() => {
                  setDeletePassword('');
                  setDeleteError('');
                  setShowDeleteModal(true);
                }}
                id="open-delete-modal-btn"
              >
                Delete Account Permanently
              </Button>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => !deleteLoading && setShowDeleteModal(false)}
        centered
        contentClassName="bg-dark text-white border-secondary"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="text-danger fw-bold fs-5">
            ⚠️ Confirm Permanent Account Deletion
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={confirmAccountDeletion}>
          <Modal.Body>
            <div className="p-3 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25 mb-3">
              <strong className="text-danger d-block mb-1">Warning: Irreversible Action</strong>
              <p className="small text-white-50 mb-0">
                Are you sure you want to permanently delete your account (<strong>{user?.email || user?.phone || user?.name}</strong>)? All your balances, entries, and rewards will be permanently erased.
              </p>
            </div>

            {deleteError && (
              <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                <span>⚠️</span>
                <div>{deleteError}</div>
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="submit"
              disabled={deleteLoading}
              id="confirm-delete-account-btn"
            >
              {deleteLoading ? 'Deleting Account...' : 'Yes, Delete My Account'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Redeem Promo Code Modal */}
      <GiveawayCodeModal
        show={showCodeModal}
        onHide={() => setShowCodeModal(false)}
      />

      {/* Withdraw Rewards & Physical Gifts Modal */}
      <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: 'rgba(15, 20, 36, 0.98)', borderColor: 'rgba(140, 120, 255, 0.2)' }}>
          <Modal.Title className="d-flex align-items-center gap-2 text-white">
            <span>🎁</span> Withdraw Rewards & Physical Gifts
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'rgba(15, 20, 36, 0.98)', color: '#edf2ff' }} className="p-4">
          {/* Order / Delivery Confirmation Card */}
          {orderReceipt ? (
            <div className="text-center py-2">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3 shadow-lg"
                style={{
                  width: 72,
                  height: 72,
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)',
                  border: '2px solid rgba(52, 211, 153, 0.5)',
                  fontSize: '2rem'
                }}
              >
                🚚
              </div>
              <Badge bg="success" className="px-3 py-1 mb-2 text-uppercase fw-bold letter-spacing-1">
                ✓ Order Confirmed • Delivered in 4 Days
              </Badge>
              <h3 className="fw-bold text-white mb-2">Your Gift Is On The Way!</h3>
              <p className="text-white-50 small mb-4">
                Your order for <strong>{orderReceipt.giftItem}</strong> has been confirmed and dispatched for express delivery to your address.
              </p>

              <div className="p-3 mb-4 rounded-3 text-start mx-auto" style={{ maxWidth: 520, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom border-secondary border-opacity-25">
                  <span className="text-white-50 small">Tracking Number:</span>
                  <code className="text-info fw-bold">{orderReceipt.trackingNumber}</code>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom border-secondary border-opacity-25">
                  <span className="text-white-50 small">Guaranteed Delivery:</span>
                  <strong className="text-success small">Within 4 Business Days 📦</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom border-secondary border-opacity-25">
                  <span className="text-white-50 small">Expected By:</span>
                  <strong className="text-white small">
                    {new Date(orderReceipt.expectedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </strong>
                </div>
                <div>
                  <span className="text-white-50 small d-block mb-1">Delivering To:</span>
                  <div className="small text-white p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                    <strong>{withdrawData.recipientName}</strong> ({withdrawData.phone})<br />
                    {orderReceipt.shippingAddress}
                  </div>
                </div>
              </div>

              <Button
                className="btn-primary-custom px-4 py-2 fw-bold"
                onClick={() => {
                  setOrderReceipt(null);
                  setShowWithdrawModal(false);
                }}
              >
                Done / Back to Profile →
              </Button>
            </div>
          ) : (
            <>
              {/* Category Selector Tabs */}
              <div className="bg-dark p-1 rounded-3 mb-3 border border-secondary border-opacity-50 d-flex">
                <button
                  type="button"
                  className={`btn flex-fill py-2 text-center small fw-bold rounded-2 border-0 ${
                    withdrawType === 'PHYSICAL_GIFT' ? 'btn-primary text-white shadow-sm' : 'text-white-50'
                  }`}
                  onClick={() => {
                    setWithdrawType('PHYSICAL_GIFT');
                    setWithdrawError('');
                    setWithdrawSuccess('');
                  }}
                  id="tab-physical-gift"
                >
                  📦 Physical Gifts (Delivered in 4 Days)
                </button>
                <button
                  type="button"
                  className={`btn flex-fill py-2 text-center small fw-bold rounded-2 border-0 ${
                    withdrawType === 'MONEY' ? 'btn-primary text-white shadow-sm' : 'text-white-50'
                  }`}
                  onClick={() => {
                    setWithdrawType('MONEY');
                    setWithdrawError('');
                    setWithdrawSuccess('');
                  }}
                  id="tab-money-payout"
                >
                  💳 Money / Digital Payout
                </button>
              </div>

              {withdrawSuccess && (
                <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <span>✅</span>
                  <div>{withdrawSuccess}</div>
                </Alert>
              )}

              {withdrawError && (
                <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <span>⚠️</span>
                  <div>{withdrawError}</div>
                </Alert>
              )}

              <Form onSubmit={async (e) => {
                e.preventDefault();
                setWithdrawError('');
                setWithdrawSuccess('');

                const numAmount = Number(withdrawData.amount);
                const available = Number(balances[withdrawData.currency] || 0);

                if (!numAmount || numAmount <= 0) {
                  setWithdrawError('Please enter an amount greater than 0.');
                  return;
                }

                if (numAmount > available) {
                  setWithdrawError(`Insufficient ${withdrawData.currency} balance. Available: ${available.toLocaleString()}`);
                  return;
                }

                if (withdrawType === 'PHYSICAL_GIFT') {
                  const { recipientName, phone, address, city, state, pin } = withdrawData;
                  if (!recipientName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pin.trim()) {
                    setWithdrawError('Please fill in all shipping address fields (Full Name, Phone, Street, City, State, and PIN code).');
                    return;
                  }
                } else {
                  if (!withdrawData.destination.trim()) {
                    setWithdrawError('Please enter your payout destination details.');
                    return;
                  }
                }

                setWithdrawLoading(true);
                try {
                  const payload = {
                    withdrawalType: withdrawType,
                    currency: withdrawData.currency,
                    amount: numAmount
                  };

                  if (withdrawType === 'PHYSICAL_GIFT') {
                    payload.giftItem = withdrawData.giftItem;
                    payload.shippingAddress = {
                      recipientName: withdrawData.recipientName.trim(),
                      phone: withdrawData.phone.trim(),
                      address: withdrawData.address.trim(),
                      city: withdrawData.city.trim(),
                      state: withdrawData.state.trim(),
                      pin: withdrawData.pin.trim()
                    };
                  } else {
                    payload.payoutMethod = withdrawData.payoutMethod;
                    payload.destination = withdrawData.destination.trim();
                  }

                  const res = await api.post('/auth/withdraw', payload);

                  if (res.data?.balances && user) {
                    const updatedUser = {
                      ...user,
                      balances: res.data.balances,
                      points: res.data.balances.VEs
                    };
                    setUser(updatedUser);
                    localStorage.setItem('veloop-user', JSON.stringify(updatedUser));
                  }

                  if (withdrawType === 'PHYSICAL_GIFT' && res.data?.trackingNumber) {
                    setOrderReceipt({
                      giftItem: res.data.giftItem || withdrawData.giftItem,
                      trackingNumber: res.data.trackingNumber,
                      expectedDeliveryDate: res.data.expectedDeliveryDate,
                      shippingAddress: res.data.shippingAddress
                    });
                  } else {
                    setWithdrawSuccess(res.data?.message || `Withdrawal of ${numAmount} ${withdrawData.currency} submitted successfully!`);
                    setTimeout(() => setShowWithdrawModal(false), 2000);
                  }
                } catch (err) {
                  setWithdrawError(err.response?.data?.message || 'Withdrawal failed. Please check your balance and details.');
                } finally {
                  setWithdrawLoading(false);
                }
              }}>

                {/* ── OPTION A: PHYSICAL GIFTS DELIVERED WITHIN 4 DAYS ── */}
                {withdrawType === 'PHYSICAL_GIFT' && (
                  <>
                    {/* 4-Day Delivery Guarantee Banner */}
                    <div className="p-3 mb-3 rounded border border-success border-opacity-40 bg-success bg-opacity-10 d-flex align-items-center gap-3">
                      <span className="fs-3">🚚</span>
                      <div>
                        <strong className="text-success d-block small">Guaranteed 4-Day Home Delivery</strong>
                        <span className="text-white-50 small" style={{ fontSize: '0.8rem' }}>
                          Physical gifts are dispatched within 24h via express courier and delivered directly to your doorstep within <strong>4 business days</strong>.
                        </span>
                      </div>
                    </div>

                    {/* Gift Catalog Selection */}
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white-50 small fw-bold">Select Physical Reward Gift</Form.Label>
                      <div className="d-flex flex-column gap-2 mb-2">
                        {[
                          { title: 'Apple iPhone 15 Pro (128GB)', cost: 5000, icon: '📱' },
                          { title: 'MacBook Air M2 Space Gray', cost: 10000, icon: '💻' },
                          { title: 'Sony Wireless ANC Earbuds', cost: 1000, icon: '🎧' },
                          { title: 'Smart Watch Fitness Series 9', cost: 1500, icon: '⌚' },
                          { title: 'VELOOP VIP Tech Hamper & Swag Box', cost: 500, icon: '🎁' }
                        ].map((gift) => (
                          <div
                            key={gift.title}
                            className={`p-2 px-3 rounded d-flex justify-content-between align-items-center cursor-pointer border ${
                              withdrawData.giftItem === gift.title
                                ? 'border-primary bg-primary bg-opacity-20 text-white'
                                : 'border-secondary border-opacity-25 bg-dark bg-opacity-50 text-white-50'
                            }`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setWithdrawData({
                                ...withdrawData,
                                giftItem: gift.title,
                                amount: String(gift.cost)
                              });
                            }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span>{gift.icon}</span>
                              <span className="fw-semibold text-white small">{gift.title}</span>
                            </div>
                            <Badge bg={balances.VEs >= gift.cost ? 'success' : 'secondary'} className="px-2 py-1">
                              {gift.cost.toLocaleString()} VEs
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Form.Group>

                    {/* Currency & Amount */}
                    <Row className="g-2 mb-3">
                      <Col xs={12} sm={6}>
                        <Form.Label className="text-white-50 small fw-bold">Currency to Deduct</Form.Label>
                        <Form.Select
                          value={withdrawData.currency}
                          onChange={(e) => setWithdrawData({ ...withdrawData, currency: e.target.value })}
                          className="bg-dark text-white border-secondary"
                        >
                          <option value="VEs">💎 VEs (Available: {Number(balances.VEs || 0).toLocaleString()})</option>
                          <option value="SVEs">⚡ SVEs (Available: {Number(balances.SVEs || 0).toLocaleString()})</option>
                          <option value="Tokens">🪙 Tokens (Available: {Number(balances.Tokens || 0).toLocaleString()})</option>
                        </Form.Select>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Label className="text-white-50 small fw-bold">Points Cost</Form.Label>
                        <Form.Control
                          type="number"
                          value={withdrawData.amount}
                          onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                          className="bg-dark text-white border-secondary"
                          required
                        />
                      </Col>
                    </Row>

                    {/* Complete Shipping Delivery Address Form */}
                    <div className="p-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-30 mb-3">
                      <h6 className="text-white small fw-bold mb-3 d-flex align-items-center gap-2">
                        <span>📍</span> Shipping Address (Delivered to this address in 4 days)
                      </h6>
                      <Row className="g-2">
                        <Col xs={12} sm={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small fw-bold mb-1">Recipient Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Full Name"
                              value={withdrawData.recipientName}
                              onChange={(e) => setWithdrawData({ ...withdrawData, recipientName: e.target.value })}
                              className="bg-dark text-white border-secondary small"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small fw-bold mb-1">Mobile Phone (for courier)</Form.Label>
                            <Form.Control
                              type="tel"
                              placeholder="+91 90000 00000"
                              value={withdrawData.phone}
                              onChange={(e) => setWithdrawData({ ...withdrawData, phone: e.target.value })}
                              className="bg-dark text-white border-secondary small"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12}>
                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small fw-bold mb-1">Street Address / House / Flat No.</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Apartment, Street Name, Landmark"
                              value={withdrawData.address}
                              onChange={(e) => setWithdrawData({ ...withdrawData, address: e.target.value })}
                              className="bg-dark text-white border-secondary small"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} sm={4}>
                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small fw-bold mb-1">City</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="City"
                              value={withdrawData.city}
                              onChange={(e) => setWithdrawData({ ...withdrawData, city: e.target.value })}
                              className="bg-dark text-white border-secondary small"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} sm={4}>
                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small fw-bold mb-1">State / Province</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="State"
                              value={withdrawData.state}
                              onChange={(e) => setWithdrawData({ ...withdrawData, state: e.target.value })}
                              className="bg-dark text-white border-secondary small"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} sm={4}>
                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small fw-bold mb-1">PIN / Postal Code</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="PIN Code"
                              value={withdrawData.pin}
                              onChange={(e) => setWithdrawData({ ...withdrawData, pin: e.target.value })}
                              className="bg-dark text-white border-secondary small"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </>
                )}

                {/* ── OPTION B: MONEY / DIGITAL PAYOUT ── */}
                {withdrawType === 'MONEY' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white-50 small fw-bold">Select Currency</Form.Label>
                      <Form.Select
                        value={withdrawData.currency}
                        onChange={(e) => setWithdrawData({ ...withdrawData, currency: e.target.value })}
                        className="bg-dark text-white border-secondary"
                      >
                        <option value="VEs">💎 VEs (Available: {Number(balances.VEs || 0).toLocaleString()})</option>
                        <option value="SVEs">⚡ SVEs (Available: {Number(balances.SVEs || 0).toLocaleString()})</option>
                        <option value="Tokens">🪙 Tokens (Available: {Number(balances.Tokens || 0).toLocaleString()})</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="text-white-50 small fw-bold">Amount to Withdraw</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max={balances[withdrawData.currency] || 0}
                        placeholder={`Max: ${balances[withdrawData.currency] || 0}`}
                        value={withdrawData.amount}
                        onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                        className="bg-dark text-white border-secondary"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="text-white-50 small fw-bold">Payout Method</Form.Label>
                      <Form.Select
                        value={withdrawData.payoutMethod}
                        onChange={(e) => setWithdrawData({ ...withdrawData, payoutMethod: e.target.value })}
                        className="bg-dark text-white border-secondary"
                      >
                        <option value="UPI">UPI ID (Instant Bank Transfer)</option>
                        <option value="Bank">Bank Account (NEFT / IMPS)</option>
                        <option value="Crypto">Crypto Wallet Address (USDT / Polygon)</option>
                        <option value="Voucher">Digital Brand Gift Card Voucher</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="text-white-50 small fw-bold">
                        {withdrawData.payoutMethod === 'UPI' ? 'UPI ID (e.g. user@okaxis / user@upi)' :
                         withdrawData.payoutMethod === 'Bank' ? 'Account Number & IFSC Code' :
                         withdrawData.payoutMethod === 'Crypto' ? 'Polygon / USDT Wallet Address' :
                         'Recipient Email for Gift Voucher'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={withdrawData.payoutMethod === 'UPI' ? 'user@okaxis' : 'Enter payout details'}
                        value={withdrawData.destination}
                        onChange={(e) => setWithdrawData({ ...withdrawData, destination: e.target.value })}
                        className="bg-dark text-white border-secondary"
                        required
                      />
                    </Form.Group>
                  </>
                )}

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="outline-light" size="sm" onClick={() => setShowWithdrawModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="btn-primary-custom"
                    size="sm"
                    disabled={withdrawLoading || !withdrawData.amount || Number(withdrawData.amount) <= 0}
                  >
                    {withdrawLoading
                      ? 'Processing Request...'
                      : withdrawType === 'PHYSICAL_GIFT'
                      ? '📦 Order Gift (Deliver in 4 Days) →'
                      : '💸 Confirm Money Withdrawal →'}
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

export default ProfilePage;
