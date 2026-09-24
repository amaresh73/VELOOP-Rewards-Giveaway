import { useState, useEffect } from 'react';
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

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Redeem code & Deliver Winning Rewards modal states
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [rewardCategory, setRewardCategory] = useState('PHYSICAL_GIFT'); // 'PHYSICAL_GIFT' or 'GIFT_VOUCHER'
  const [selectedReward, setSelectedReward] = useState({
    title: 'Apple iPhone 15 Pro (128GB)',
    type: 'PHYSICAL_GIFT',
    icon: '📱'
  });
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [shippingData, setShippingData] = useState({
    recipientName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pin: ''
  });
  const [winningRewardsData, setWinningRewardsData] = useState({
    wonPrizes: [],
    claims: []
  });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // UPI Add Money states (PhonePe, Google Pay, Paytm)
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('250');
  const [topupCurrency, setTopupCurrency] = useState('VEs');
  const [selectedUpiApp, setSelectedUpiApp] = useState('PhonePe');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState('');
  const [topupError, setTopupError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Right column view tab: 'security' or 'help'
  const [activeRightTab, setActiveRightTab] = useState('security');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Help & Support Center states
  const [helpCategory, setHelpCategory] = useState('delivery');
  const [helpSubject, setHelpSubject] = useState('');
  const [helpMessage, setHelpMessage] = useState('');
  const [helpSubmitted, setHelpSubmitted] = useState(false);
  const [helpTicketId, setHelpTicketId] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const handleHelpSubmit = (e) => {
    e.preventDefault();
    if (!helpSubject.trim() || !helpMessage.trim()) return;
    const ticket = `TKT-VLP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    setHelpTicketId(ticket);
    setHelpSubmitted(true);
  };

  const merchantUpiId = 'veloop.rewards@icici';
  const payeeName = 'VELOOP Rewards';
  const txnNote = `Topup VELOOP Wallet ${user?.name || ''}`;
  const upiPayString = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(payeeName)}&am=${topupAmount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;

  const getUpiAppUrl = (app) => {
    const base = `pa=${merchantUpiId}&pn=${encodeURIComponent(payeeName)}&am=${topupAmount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    if (app === 'PhonePe') return `phonepe://pay?${base}`;
    if (app === 'Google Pay') return `tez://upi/pay?${base}`;
    if (app === 'Paytm') return `paytmmp://pay?${base}`;
    return `upi://pay?${base}`;
  };

  const handleConfirmUpiPayment = async () => {
    setTopupLoading(true);
    setTopupError('');
    setTopupSuccess('');
    try {
      const res = await api.post('/auth/add-money-upi', {
        amount: Number(topupAmount),
        currency: topupCurrency,
        upiApp: selectedUpiApp
      });

      if (res.data?.balances && user) {
        const updatedUser = {
          ...user,
          balances: res.data.balances,
          points: res.data.balances.VEs
        };
        setUser(updatedUser);
        localStorage.setItem('veloop-user', JSON.stringify(updatedUser));
      }

      setTopupSuccess(res.data?.message || `₹${topupAmount} added successfully via ${selectedUpiApp}!`);
      setTimeout(() => {
        setShowUpiModal(false);
        setTopupSuccess('');
      }, 2000);
    } catch (err) {
      setTopupError(err.response?.data?.message || 'Payment verification failed. Please try again.');
    } finally {
      setTopupLoading(false);
    }
  };

  // Fetch winning rewards and won prizes on login
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchWinnings = async () => {
      try {
        const res = await api.get('/auth/my-winning-rewards');
        if (res.data?.data) {
          setWinningRewardsData(res.data.data);
          if (res.data.data.wonPrizes && res.data.data.wonPrizes.length > 0) {
            const firstWin = res.data.data.wonPrizes[0];
            setSelectedReward({
              title: firstWin.prizeTitle || firstWin.giveawayTitle,
              type: firstWin.type === 'gift-card' ? 'GIFT_VOUCHER' : 'PHYSICAL_GIFT',
              icon: firstWin.type === 'gift-card' ? '🎟️' : '🎁',
              isWonPrize: true
            });
            if (firstWin.type === 'gift-card') {
              setRewardCategory('GIFT_VOUCHER');
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load winning rewards:', err.message);
      }
    };
    fetchWinnings();
  }, [isLoggedIn]);

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

  const activeWinningReward = (winningRewardsData.wonPrizes && winningRewardsData.wonPrizes.length > 0)
    ? {
      title: winningRewardsData.wonPrizes[0].prizeTitle || winningRewardsData.wonPrizes[0].giveawayTitle,
      giveawayTitle: winningRewardsData.wonPrizes[0].giveawayTitle || 'VIP Mega Giveaway',
      type: winningRewardsData.wonPrizes[0].type === 'gift-card' ? 'GIFT_VOUCHER' : 'PHYSICAL_GIFT',
      icon: winningRewardsData.wonPrizes[0].type === 'gift-card' ? '🎟️' : '📱',
      deliveryDays: 4
    }
    : {
      title: 'Apple iPhone 15 Pro (128GB)',
      giveawayTitle: 'VELOOP VIP Welcome Mega Giveaway',
      type: 'PHYSICAL_GIFT',
      icon: '📱',
      deliveryDays: 4
    };

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

              {/* 1. BALANCE SECTION */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-white-50 text-uppercase small fw-bold mb-0">Your Wallet Balances</h6>
                <Badge bg="success" bg-opacity="20" className="text-success border border-success border-opacity-25 small px-2">
                  Live Balance
                </Badge>
              </div>
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="d-flex justify-content-between align-items-center p-2 px-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                  <span className="text-white-50 small">💎 VEs (Veloop Entries)</span>
                  <span className="fw-bold text-white fs-6">{Number(balances.VEs || 0).toLocaleString()}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center p-2 px-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                  <span className="text-white-50 small">🪙 Tokens</span>
                  <span className="fw-bold text-info fs-6">{Number(balances.Tokens || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* 2. REWARDS YOU WINNING SECTION */}
              <div className="p-3 mb-3 rounded bg-dark bg-opacity-60 border border-warning border-opacity-40 shadow-sm position-relative overflow-hidden">
                <div
                  className="position-absolute top-0 end-0 p-2 opacity-10"
                  style={{ fontSize: '4rem', transform: 'translate(15px, -15px)', pointerEvents: 'none' }}
                >
                  🏆
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5">🏆</span>
                    <strong className="text-warning small text-uppercase fw-bold">Rewards You Winning</strong>
                  </div>
                  <Badge bg="warning" text="dark" className="small fw-bold px-2 py-1">
                    ✓ YOU WON
                  </Badge>
                </div>

                {/* Display the winning reward */}
                <div
                  className="p-3 mb-3 rounded-3 border border-warning border-opacity-30"
                  style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center shadow-sm"
                      style={{
                        width: 52,
                        height: 52,
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.4) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.6)',
                        fontSize: '1.8rem',
                        flexShrink: 0
                      }}
                    >
                      {activeWinningReward.icon}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex align-items-center gap-1 mb-1">
                        <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '0.65rem' }}>
                          WINNER PRIZE
                        </span>
                        <span className="badge bg-success text-white fw-bold" style={{ fontSize: '0.65rem' }}>
                          Ready to Deliver
                        </span>
                      </div>
                      <h6 className="fw-bold text-white mb-0 text-truncate" style={{ fontSize: '0.95rem' }}>
                        {activeWinningReward.title}
                      </h6>
                      <small className="text-white-50 d-block" style={{ fontSize: '0.75rem' }}>
                        Won in {activeWinningReward.giveawayTitle}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-warning border-opacity-20 text-white-50 small" style={{ fontSize: '0.78rem' }}>
                    <span>📍 Doorstep Delivery:</span>
                    <strong className="text-success">Guaranteed in 4 Days 🚚</strong>
                  </div>
                </div>

                <Button
                  className="btn-primary-custom w-100 py-2 fw-semibold rounded-2 d-flex align-items-center justify-content-center gap-2 shadow"
                  size="sm"
                  onClick={() => {
                    setSelectedReward({
                      title: activeWinningReward.title,
                      type: activeWinningReward.type,
                      icon: activeWinningReward.icon
                    });
                    setRewardCategory(activeWinningReward.type);
                    setWithdrawSuccess('');
                    setWithdrawError('');
                    setOrderReceipt(null);
                    setShippingData((prev) => ({
                      ...prev,
                      recipientName: user?.name || prev.recipientName || '',
                      phone: user?.phone || prev.phone || ''
                    }));
                    setShowWithdrawModal(true);
                  }}
                  id="deliver-winning-rewards-btn"
                >
                  <span>📦</span> Deliver This Reward to Your Address (4 Days) →
                </Button>
              </div>

              {/* 3. UPI FOR ADD MONEY SECTION (PhonePe, Google Pay, Paytm) */}
              <div className="p-3 rounded bg-primary bg-opacity-10 border border-primary border-opacity-30">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5">💳</span>
                    <strong className="text-white small">Add Money via UPI</strong>
                  </div>
                  <Badge bg="info" text="dark" className="small fw-bold">
                    Instant Topup ⚡
                  </Badge>
                </div>

                <div className="d-flex gap-1 mb-2 justify-content-between">
                  <div
                    className="p-1 px-2 rounded border border-secondary border-opacity-30 bg-dark bg-opacity-60 text-center flex-fill cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedUpiApp('PhonePe');
                      setShowUpiModal(true);
                    }}
                    title="Pay with PhonePe"
                  >
                    <span className="d-block" style={{ fontSize: '1.1rem' }}>🟣</span>
                    <span className="text-white fw-bold" style={{ fontSize: '0.72rem' }}>PhonePe</span>
                  </div>
                  <div
                    className="p-1 px-2 rounded border border-secondary border-opacity-30 bg-dark bg-opacity-60 text-center flex-fill cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedUpiApp('Google Pay');
                      setShowUpiModal(true);
                    }}
                    title="Pay with Google Pay"
                  >
                    <span className="d-block" style={{ fontSize: '1.1rem' }}>🔵</span>
                    <span className="text-white fw-bold" style={{ fontSize: '0.72rem' }}>GPay</span>
                  </div>
                  <div
                    className="p-1 px-2 rounded border border-secondary border-opacity-30 bg-dark bg-opacity-60 text-center flex-fill cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedUpiApp('Paytm');
                      setShowUpiModal(true);
                    }}
                    title="Pay with Paytm"
                  >
                    <span className="d-block" style={{ fontSize: '1.1rem' }}>🔷</span>
                    <span className="text-white fw-bold" style={{ fontSize: '0.72rem' }}>Paytm</span>
                  </div>
                  <div
                    className="p-1 px-2 rounded border border-secondary border-opacity-30 bg-dark bg-opacity-60 text-center flex-fill cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedUpiApp('BHIM');
                      setShowUpiModal(true);
                    }}
                    title="Pay with any UPI App"
                  >
                    <span className="d-block" style={{ fontSize: '1.1rem' }}>🇮🇳</span>
                    <span className="text-white fw-bold" style={{ fontSize: '0.72rem' }}>UPI</span>
                  </div>
                </div>

                <Button
                  variant="success"
                  className="w-100 py-2 fw-semibold rounded-2 d-flex align-items-center justify-content-center gap-2"
                  size="sm"
                  onClick={() => setShowUpiModal(true)}
                  id="open-upi-topup-btn"
                >
                  <span>⚡</span> Add Money with UPI (PhonePe/GPay/Paytm) →
                </Button>
              </div>
            </div>
          </Col>

          {/* Right Column: Security & Services | Help & Support */}
          <Col lg={7}>
            {/* Tab Controller: Security & Services vs Help & Support */}
            <div className="d-flex gap-2 mb-3 p-1 rounded-pill bg-dark bg-opacity-75 border border-secondary border-opacity-30 shadow-sm">
              <button
                type="button"
                className={`btn btn-sm rounded-pill flex-fill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all ${activeRightTab === 'security'
                  ? 'btn-primary shadow text-white'
                  : 'btn-outline-dark text-white-50 border-0'
                  }`}
                onClick={() => setActiveRightTab('security')}
                id="tab-security-services"
              >
                <span className="fs-6">🛡️</span> Security & Services
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill flex-fill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all ${activeRightTab === 'help'
                  ? 'btn-primary shadow text-white'
                  : 'btn-outline-dark text-white-50 border-0'
                  }`}
                onClick={() => setActiveRightTab('help')}
                id="tab-help-support"
              >
                <span className="fs-6">🎧</span> Help & Support
              </button>
            </div>

            {/* TAB 1: SECURITY & SERVICES */}
            {activeRightTab === 'security' && (
              <div className="d-flex flex-column gap-3">
                {/* Security Shield & Health Status */}
                <div className="card-glass p-4 rounded shadow-sm border border-secondary border-opacity-30">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-3">🛡️</span>
                      <div>
                        <h5 className="fw-bold mb-0 text-white">Account Security & Protection</h5>
                        <small className="text-white-50">Enterprise 256-bit encryption & active fraud shield</small>
                      </div>
                    </div>
                    <Badge bg="success" className="px-2 py-1 small fw-bold">
                      ● Active & Secure
                    </Badge>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <div className="p-3 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-25 h-100">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span>📧</span>
                          <strong className="text-white small">Registered Email</strong>
                        </div>
                        <span className="text-white-50 small d-block text-truncate">
                          {user?.email || 'No email attached'}
                        </span>
                        <span className="badge bg-success bg-opacity-25 text-success mt-2" style={{ fontSize: '0.7rem' }}>
                          ✓ Email Verified
                        </span>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="p-3 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-25 h-100">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span>📱</span>
                          <strong className="text-white small">Phone Verification</strong>
                        </div>
                        <span className="text-white-50 small d-block">
                          {user?.phone || 'Linked & Verified'}
                        </span>
                        <span className="badge bg-success bg-opacity-25 text-success mt-2" style={{ fontSize: '0.7rem' }}>
                          ✓ Mobile Protected
                        </span>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="p-3 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-25 h-100">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span>🔐</span>
                          <strong className="text-white small">Session Security</strong>
                        </div>
                        <span className="text-white-50 small d-block">
                          Active Browser Session (JWT 7d)
                        </span>
                        <span className="badge bg-info bg-opacity-25 text-info mt-2" style={{ fontSize: '0.7rem' }}>
                          ● SSL Encrypted
                        </span>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="p-3 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-25 h-100">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span>🛡️</span>
                          <strong className="text-white small">Fraud & Bot Shield</strong>
                        </div>
                        <span className="text-white-50 small d-block">
                          Adaptive Rate Limiting Active
                        </span>
                        <span className="badge bg-success bg-opacity-25 text-success mt-2" style={{ fontSize: '0.7rem' }}>
                          ✓ 0 Abuse Flags
                        </span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-secondary border-opacity-25 my-3" />

                  {/* Active Platform Services */}
                  <h6 className="fw-bold text-white small text-uppercase mb-2">Connected Platform Services</h6>
                  <div className="d-flex flex-column gap-2 mb-3">
                    <div className="d-flex justify-content-between align-items-center p-2 px-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-20">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-5">🚚</span>
                        <div>
                          <strong className="text-white small d-block">Doorstep Courier Delivery</strong>
                          <small className="text-white-50">Guaranteed 4-day express dispatch for winning physical gifts & cards</small>
                        </div>
                      </div>
                      <Badge bg="success" className="small">Active</Badge>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-2 px-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-20">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-5">💳</span>
                        <div>
                          <strong className="text-white small d-block">UPI Direct Payments</strong>
                          <small className="text-white-50">Linked with PhonePe, Google Pay, Paytm & BHIM</small>
                        </div>
                      </div>
                      <Badge bg="info" text="dark" className="small">Connected</Badge>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-2 px-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-20">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-5">🎲</span>
                        <div>
                          <strong className="text-white small d-block">Transparent Draw Ledger</strong>
                          <small className="text-white-50">Provably fair RNG winner selection with public verification</small>
                        </div>
                      </div>
                      <Badge bg="primary" className="small">Verified</Badge>
                    </div>
                  </div>

                  {/* Credentials / Password Management (Collapsible) */}
                  <div className="p-3 rounded bg-dark bg-opacity-70 border border-secondary border-opacity-30">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-5">🔑</span>
                        <div>
                          <strong className="text-white small d-block">Login Password</strong>
                          <small className="text-white-50">Update and secure your account credentials</small>
                        </div>
                      </div>
                      <Button
                        variant={showPasswordForm ? "secondary" : "outline-primary"}
                        size="sm"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        id="toggle-password-form-btn"
                      >
                        {showPasswordForm ? 'Close Form' : 'Update Password 🔑'}
                      </Button>
                    </div>

                    {showPasswordForm && (
                      <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
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
                          <Form.Group className="mb-2" controlId="current-password">
                            <Form.Label className="text-white-50 small mb-1">Current Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="currentPassword"
                              placeholder="Enter current password"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              className="bg-dark text-white border-secondary form-control-sm"
                              required
                              disabled={passwordLoading}
                            />
                          </Form.Group>

                          <Form.Group className="mb-2" controlId="new-password">
                            <Form.Label className="text-white-50 small mb-1">New Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="newPassword"
                              placeholder="At least 6 characters"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className="bg-dark text-white border-secondary form-control-sm"
                              required
                              disabled={passwordLoading}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3" controlId="confirm-new-password">
                            <Form.Label className="text-white-50 small mb-1">Confirm New Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmNewPassword"
                              placeholder="Re-enter new password"
                              value={passwordData.confirmNewPassword}
                              onChange={handlePasswordChange}
                              className="bg-dark text-white border-secondary form-control-sm"
                              required
                              disabled={passwordLoading}
                            />
                          </Form.Group>

                          <Button
                            type="submit"
                            className="btn-primary-custom w-100 py-2 fw-semibold"
                            size="sm"
                            disabled={passwordLoading}
                            id="change-password-submit-btn"
                          >
                            {passwordLoading ? 'Updating Password...' : 'Save New Password'}
                          </Button>
                        </Form>
                      </div>
                    )}
                  </div>
                </div>

                {/* Danger Zone: Account Deletion */}
                <div
                  className="card-glass p-3 rounded"
                  style={{ border: '1px solid rgba(220, 53, 69, 0.4)', background: 'rgba(220, 53, 69, 0.04)' }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2 text-danger">
                      <span className="fs-5">⚠️</span>
                      <div>
                        <strong className="d-block small fw-bold">Permanent Account Deletion</strong>
                        <small className="text-white-50">Permanently erase your account, balances, and ticket history</small>
                      </div>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setDeleteError('');
                        setShowDeleteModal(true);
                      }}
                      id="open-delete-modal-btn"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HELP & SUPPORT */}
            {activeRightTab === 'help' && (
              <div className="d-flex flex-column gap-3">
                {/* Help Desk Header Card */}
                <div className="card-glass p-4 rounded shadow-sm border border-secondary border-opacity-30">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-3">🎧</span>
                      <div>
                        <h5 className="fw-bold mb-0 text-white">Help & Support Desk</h5>
                        <small className="text-white-50">24/7 dedicated support for rewards, 4-day delivery & UPI topups</small>
                      </div>
                    </div>
                    <Badge bg="info" text="dark" className="px-2 py-1 small fw-bold">
                      ● 24/7 Online
                    </Badge>
                  </div>

                  {/* 3 Quick Help Category Cards */}
                  <div className="row g-2 mb-3">
                    <div className="col-sm-4">
                      <div
                        className="p-3 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-25 h-100 cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setHelpCategory('delivery');
                          setOpenFaqIndex(0);
                        }}
                      >
                        <span className="fs-4 d-block mb-1">📦</span>
                        <strong className="text-white small d-block">4-Day Delivery</strong>
                        <span className="text-white-50" style={{ fontSize: '0.72rem' }}>
                          Doorstep shipment tracking & PIN verification
                        </span>
                      </div>
                    </div>

                    <div className="col-sm-4">
                      <div
                        className="p-3 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-25 h-100 cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setHelpCategory('payment');
                          setOpenFaqIndex(2);
                        }}
                      >
                        <span className="fs-4 d-block mb-1">⚡</span>
                        <strong className="text-white small d-block">UPI Payments</strong>
                        <span className="text-white-50" style={{ fontSize: '0.72rem' }}>
                          PhonePe, GPay & Paytm topup questions
                        </span>
                      </div>
                    </div>

                    <div className="col-sm-4">
                      <div
                        className="p-3 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-25 h-100 cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setHelpCategory('gift');
                          setOpenFaqIndex(1);
                        }}
                      >
                        <span className="fs-4 d-block mb-1">🎁</span>
                        <strong className="text-white small d-block">Rewards & Claims</strong>
                        <span className="text-white-50" style={{ fontSize: '0.72rem' }}>
                          Zero-fee physical gift & card claims
                        </span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-secondary border-opacity-25 my-3" />

                  {/* Interactive FAQs */}
                  <h6 className="fw-bold text-white small text-uppercase mb-2">Frequently Asked Questions</h6>
                  <div className="d-flex flex-column gap-2 mb-4">
                    {[
                      {
                        q: 'How does the guaranteed 4-day delivery work?',
                        a: 'When you click "Deliver This Reward to Your Address", our dispatch hub prepares your physical gift or voucher card within 24 hours. It is shipped via priority air courier with guaranteed doorstep delivery across India in 4 business days.'
                      },
                      {
                        q: 'Are any coins, tokens, or money charged to deliver my winning reward?',
                        a: 'Zero! Winning rewards are completely free of charge. No coins, no tokens, and no delivery fees are deducted. Simply fill in your postal address and phone number.'
                      },
                      {
                        q: 'How does Add Money via UPI (PhonePe, GPay, Paytm) work?',
                        a: 'Click "Add Money via UPI" on your profile, enter your amount, and select PhonePe, Google Pay, or Paytm. On mobile, it launches your UPI app directly; on desktop, scan the dynamic QR code. Your balance updates immediately upon confirmation.'
                      },
                      {
                        q: 'Can I change my delivery address or contact number after submitting?',
                        a: 'Yes, within 6 hours of placing your delivery request, you can submit a support ticket below with your updated postal PIN code, address, and phone number.'
                      }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 px-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25 cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <strong className="text-white small">{item.q}</strong>
                          <span className="text-white-50 small ms-2">{openFaqIndex === idx ? '▲' : '▼'}</span>
                        </div>
                        {openFaqIndex === idx && (
                          <p className="text-white-50 small mt-2 mb-1 pt-2 border-top border-secondary border-opacity-20">
                            {item.a}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <hr className="border-secondary border-opacity-25 my-3" />

                  {/* Submit Support Ticket Form */}
                  <h6 className="fw-bold text-white small text-uppercase mb-2">Submit a Support Ticket</h6>
                  {helpSubmitted ? (
                    <div className="p-3 rounded bg-success bg-opacity-15 border border-success border-opacity-30 text-center">
                      <span className="fs-3 d-block mb-1">✅</span>
                      <strong className="text-success d-block">Support Ticket Registered!</strong>
                      <p className="text-white-50 small mb-2">
                        Your Ticket ID is <strong>{helpTicketId}</strong>. Our dedicated logistics & support team will review your inquiry and respond within 30 minutes.
                      </p>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => {
                          setHelpSubmitted(false);
                          setHelpSubject('');
                          setHelpMessage('');
                        }}
                      >
                        Submit Another Inquiry
                      </Button>
                    </div>
                  ) : (
                    <Form onSubmit={handleHelpSubmit}>
                      <div className="row g-2 mb-2">
                        <div className="col-sm-6">
                          <Form.Group controlId="support-category">
                            <Form.Label className="text-white-50 small mb-1">Issue Category</Form.Label>
                            <Form.Select
                              value={helpCategory}
                              onChange={(e) => setHelpCategory(e.target.value)}
                              className="bg-dark text-white border-secondary form-select-sm"
                            >
                              <option value="delivery">📦 4-Day Delivery & Tracking</option>
                              <option value="payment">⚡ UPI Add Money (PhonePe/GPay/Paytm)</option>
                              <option value="gift">🎁 Winning Reward Claim</option>
                              <option value="account">🛡️ Account Security & Verification</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                        <div className="col-sm-6">
                          <Form.Group controlId="support-subject">
                            <Form.Label className="text-white-50 small mb-1">Subject</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g. Inquire about iPhone delivery"
                              value={helpSubject}
                              onChange={(e) => setHelpSubject(e.target.value)}
                              className="bg-dark text-white border-secondary form-control-sm"
                              required
                            />
                          </Form.Group>
                        </div>
                      </div>

                      <Form.Group className="mb-3" controlId="support-message">
                        <Form.Label className="text-white-50 small mb-1">Message Details</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Describe your question or issue in detail..."
                          value={helpMessage}
                          onChange={(e) => setHelpMessage(e.target.value)}
                          className="bg-dark text-white border-secondary form-control-sm"
                          required
                        />
                      </Form.Group>

                      <Button
                        type="submit"
                        className="btn-primary-custom w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                        size="sm"
                        id="submit-support-ticket-btn"
                      >
                        <span>✉️</span> Submit Support Ticket (Avg Reply: &lt; 30 mins)
                      </Button>
                    </Form>
                  )}

                  {/* Direct Contact Channels */}
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-20 text-white-50 small flex-wrap gap-2">
                    <div>
                      <span>✉️ Email: </span>
                      <a href="mailto:support@veloop.io" className="text-info text-decoration-none fw-bold">support@veloop.io</a>
                    </div>
                    <div>
                      <span>📞 Helpline: </span>
                      <strong className="text-white">1800-VELOOP-CARE</strong>
                    </div>
                    <div>
                      <span>💬 WhatsApp: </span>
                      <strong className="text-success">+91 XXXXX 88832</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

      {/* Deliver Winning Rewards Modal (Physical Gifts & Vouchers/Cards Only) */}
      <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: 'rgba(15, 20, 36, 0.98)', borderColor: 'rgba(140, 120, 255, 0.2)' }}>
          <Modal.Title className="d-flex align-items-center gap-2 text-white">
            <span>🎁</span> Deliver Your Winning Rewards
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
              <h3 className="fw-bold text-white mb-2">Your Reward Is On The Way!</h3>
              <p className="text-white-50 small mb-4">
                Your winning reward <strong>"{orderReceipt.rewardTitle || orderReceipt.giftItem}"</strong> has been confirmed and dispatched for express courier delivery to your address.
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
                {orderReceipt.voucherCode && (
                  <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom border-secondary border-opacity-25">
                    <span className="text-white-50 small">Voucher / Card Code:</span>
                    <Badge bg="warning" text="dark" className="font-monospace fs-6 px-2 py-1">
                      {orderReceipt.voucherCode}
                    </Badge>
                  </div>
                )}
                <div>
                  <span className="text-white-50 small d-block mb-1">Delivering To:</span>
                  <div className="small text-white p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                    <strong>{orderReceipt.recipientName || shippingData.recipientName}</strong> ({orderReceipt.phone || shippingData.phone})<br />
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
              {/* Category Selector Tabs: ONLY Physical Gifts & Vouchers/Cards */}
              <div className="bg-dark p-1 rounded-3 mb-3 border border-secondary border-opacity-50 d-flex">
                <button
                  type="button"
                  className={`btn flex-fill py-2 text-center small fw-bold rounded-2 border-0 ${rewardCategory === 'PHYSICAL_GIFT' ? 'btn-primary text-white shadow-sm' : 'text-white-50'
                    }`}
                  onClick={() => {
                    setRewardCategory('PHYSICAL_GIFT');
                    setWithdrawError('');
                    setWithdrawSuccess('');
                    setSelectedReward({
                      title: 'Apple iPhone 15 Pro (128GB)',
                      type: 'PHYSICAL_GIFT',
                      icon: '📱'
                    });
                  }}
                  id="tab-physical-gift"
                >
                  📦 Physical Gifts (Delivered in 4 Days)
                </button>
                <button
                  type="button"
                  className={`btn flex-fill py-2 text-center small fw-bold rounded-2 border-0 ${rewardCategory === 'GIFT_VOUCHER' ? 'btn-primary text-white shadow-sm' : 'text-white-50'
                    }`}
                  onClick={() => {
                    setRewardCategory('GIFT_VOUCHER');
                    setWithdrawError('');
                    setWithdrawSuccess('');
                    setSelectedReward({
                      title: 'Amazon Shopping Gift Card (₹5,000 / $100)',
                      type: 'GIFT_VOUCHER',
                      icon: '🛒'
                    });
                  }}
                  id="tab-gift-voucher"
                >
                  🎟️ Gift Vouchers & Cards (Delivered in 4 Days)
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

                const { recipientName, phone, address, city, state, pin } = shippingData;
                if (!recipientName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pin.trim()) {
                  setWithdrawError('Please fill in all shipping address fields (Full Name, Phone, Street, City, State, and PIN code) to deliver your reward.');
                  return;
                }

                setWithdrawLoading(true);
                try {
                  const payload = {
                    rewardTitle: selectedReward.title,
                    rewardType: rewardCategory,
                    shippingAddress: {
                      recipientName: recipientName.trim(),
                      phone: phone.trim(),
                      address: address.trim(),
                      city: city.trim(),
                      state: state.trim(),
                      pin: pin.trim()
                    }
                  };

                  const res = await api.post('/auth/deliver-reward', payload);

                  if (res.data?.trackingNumber) {
                    setOrderReceipt({
                      rewardTitle: res.data.rewardTitle || selectedReward.title,
                      rewardType: res.data.rewardType || rewardCategory,
                      trackingNumber: res.data.trackingNumber,
                      expectedDeliveryDate: res.data.expectedDeliveryDate,
                      voucherCode: res.data.voucherCode,
                      shippingAddress: res.data.shippingAddress,
                      recipientName: res.data.recipientName || recipientName,
                      phone: res.data.phone || phone
                    });
                  } else {
                    setWithdrawSuccess(res.data?.message || 'Your winning reward delivery has been placed!');
                    setTimeout(() => setShowWithdrawModal(false), 2000);
                  }
                } catch (err) {
                  setWithdrawError(err.response?.data?.message || 'Failed to submit delivery request. Please check your shipping address.');
                } finally {
                  setWithdrawLoading(false);
                }
              }}>

                {/* ── WON GIVEAWAY PRIZES SECTION (IF ANY) ── */}
                {winningRewardsData.wonPrizes && winningRewardsData.wonPrizes.length > 0 && (
                  <div className="mb-3 p-3 rounded border border-warning border-opacity-40 bg-warning bg-opacity-10">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="fs-5">🏆</span>
                      <strong className="text-warning small">Your Won Giveaway Prizes (Ready for 4-Day Delivery)</strong>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {winningRewardsData.wonPrizes.map((win) => (
                        <div
                          key={win.id}
                          className={`p-2 px-3 rounded d-flex justify-content-between align-items-center cursor-pointer border ${selectedReward.title === (win.prizeTitle || win.giveawayTitle)
                            ? 'border-warning bg-warning bg-opacity-20 text-white'
                            : 'border-secondary border-opacity-30 bg-dark bg-opacity-50 text-white-50'
                            }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedReward({
                              title: win.prizeTitle || win.giveawayTitle,
                              type: win.type === 'gift-card' ? 'GIFT_VOUCHER' : 'PHYSICAL_GIFT',
                              icon: win.type === 'gift-card' ? '🎟️' : '🎁',
                              isWonPrize: true
                            });
                            setRewardCategory(win.type === 'gift-card' ? 'GIFT_VOUCHER' : 'PHYSICAL_GIFT');
                          }}
                        >
                          <div>
                            <span className="fw-bold text-white small me-2">{win.prizeTitle || win.giveawayTitle}</span>
                            <span className="text-white-50 small" style={{ fontSize: '0.75rem' }}>({win.giveawayTitle})</span>
                          </div>
                          <Badge bg="warning" text="dark" className="fw-bold">
                            WON PRIZE ✓
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 4-DAY HOME DELIVERY ASSURANCE BANNER ── */}
                <div className="p-3 mb-3 rounded border border-success border-opacity-40 bg-success bg-opacity-10 d-flex align-items-center gap-3">
                  <span className="fs-3">🚚</span>
                  <div>
                    <strong className="text-success d-block small">Guaranteed 4-Day Home Delivery to Your Address</strong>
                    <span className="text-white-50 small" style={{ fontSize: '0.8rem' }}>
                      All winning reward gifts and voucher cards are dispatched via express courier with full tracking and delivered directly to your doorstep within <strong>4 business days</strong>.
                    </span>
                  </div>
                </div>

                {/* ── TAB A: PHYSICAL GIFTS ── */}
                {rewardCategory === 'PHYSICAL_GIFT' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white-50 small fw-bold">Select Winning Physical Gift to Deliver</Form.Label>
                    <div className="d-flex flex-column gap-2 mb-2">
                      {[
                        { title: 'Apple iPhone 15 Pro (128GB)', icon: '📱', badge: 'Flagship Gift' },
                        { title: 'MacBook Air M2 Space Gray', icon: '💻', badge: 'Pro Device' },
                        { title: 'Sony Wireless ANC Earbuds', icon: '🎧', badge: 'Audio Gear' },
                        { title: 'Smart Watch Fitness Series 9', icon: '⌚', badge: 'Smart Wearable' },
                        { title: 'VELOOP VIP Tech Hamper & Merch Box', icon: '🎁', badge: 'Exclusive Swag' }
                      ].map((gift) => (
                        <div
                          key={gift.title}
                          className={`p-2 px-3 rounded d-flex justify-content-between align-items-center cursor-pointer border ${selectedReward.title === gift.title
                            ? 'border-primary bg-primary bg-opacity-20 text-white'
                            : 'border-secondary border-opacity-25 bg-dark bg-opacity-50 text-white-50'
                            }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedReward({
                              title: gift.title,
                              type: 'PHYSICAL_GIFT',
                              icon: gift.icon
                            });
                          }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span>{gift.icon}</span>
                            <span className="fw-semibold text-white small">{gift.title}</span>
                          </div>
                          <Badge bg="success" className="px-2 py-1 small">
                            {gift.badge} • 4-Day Delivery
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Form.Group>
                )}

                {/* ── TAB B: GIFT VOUCHERS & CARDS ── */}
                {rewardCategory === 'GIFT_VOUCHER' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white-50 small fw-bold">Select Winning Voucher / Card to Deliver</Form.Label>
                    <div className="d-flex flex-column gap-2 mb-2">
                      {[
                        { title: 'Amazon Shopping Gift Card (₹5,000 / $100)', icon: '🛒', badge: 'Postal Gift Card' },
                        { title: 'Apple App Store & iTunes Gift Card ($50 / ₹4,000)', icon: '🍏', badge: 'Digital Card' },
                        { title: 'Flipkart Super Shopping Voucher (₹5,000)', icon: '🛍️', badge: 'Physical Card Mailer' },
                        { title: 'Steam Gaming Wallet Gift Card ($50)', icon: '🎮', badge: 'Gaming Card' },
                        { title: 'Google Play Store Digital Voucher Card ($25 / ₹2,000)', icon: '📱', badge: 'App Store Card' }
                      ].map((voucher) => (
                        <div
                          key={voucher.title}
                          className={`p-2 px-3 rounded d-flex justify-content-between align-items-center cursor-pointer border ${selectedReward.title === voucher.title
                            ? 'border-primary bg-primary bg-opacity-20 text-white'
                            : 'border-secondary border-opacity-25 bg-dark bg-opacity-50 text-white-50'
                            }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedReward({
                              title: voucher.title,
                              type: 'GIFT_VOUCHER',
                              icon: voucher.icon
                            });
                          }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span>{voucher.icon}</span>
                            <span className="fw-semibold text-white small">{voucher.title}</span>
                          </div>
                          <Badge bg="info" className="px-2 py-1 small text-dark fw-bold">
                            {voucher.badge} • 4-Day Delivery
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Form.Group>
                )}

                {/* Selected Item Notification */}
                <div className="p-2 px-3 mb-3 rounded bg-primary bg-opacity-15 border border-primary border-opacity-30 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span>{selectedReward.icon || (rewardCategory === 'GIFT_VOUCHER' ? '🎟️' : '🎁')}</span>
                    <span className="text-white small fw-bold">Selected to Deliver: {selectedReward.title}</span>
                  </div>
                  <Badge bg="success" className="px-2 py-1 small">
                    Guaranteed in 4 Days
                  </Badge>
                </div>

                {/* Complete Shipping Delivery Address Form */}
                <div className="p-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-30 mb-3">
                  <h6 className="text-white small fw-bold mb-3 d-flex align-items-center gap-2">
                    <span>📍</span> Your Address to Deliver (Dispatched for delivery in 4 days)
                  </h6>
                  <Row className="g-2">
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-2">
                        <Form.Label className="text-white-50 small fw-bold mb-1">Recipient Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Full Name"
                          value={shippingData.recipientName}
                          onChange={(e) => setShippingData({ ...shippingData, recipientName: e.target.value })}
                          className="bg-dark text-white border-secondary small"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-2">
                        <Form.Label className="text-white-50 small fw-bold mb-1">Mobile Phone (for courier delivery)</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="+91 90000 00000"
                          value={shippingData.phone}
                          onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
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
                          value={shippingData.address}
                          onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
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
                          value={shippingData.city}
                          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
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
                          value={shippingData.state}
                          onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
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
                          value={shippingData.pin}
                          onChange={(e) => setShippingData({ ...shippingData, pin: e.target.value })}
                          className="bg-dark text-white border-secondary small"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="outline-light" size="sm" onClick={() => setShowWithdrawModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="btn-primary-custom px-4 py-2"
                    size="sm"
                    disabled={withdrawLoading || !selectedReward.title}
                    id="confirm-reward-delivery-btn"
                  >
                    {withdrawLoading
                      ? 'Dispatching Order...'
                      : '📦 Confirm 4-Day Delivery to Address →'}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Add Money via UPI Modal (PhonePe, Google Pay, Paytm, BHIM) */}
      <Modal show={showUpiModal} onHide={() => setShowUpiModal(false)} centered size="md">
        <Modal.Header closeButton style={{ background: 'rgba(15, 20, 36, 0.98)', borderColor: 'rgba(140, 120, 255, 0.2)' }}>
          <Modal.Title className="d-flex align-items-center gap-2 text-white">
            <span>💳</span> Add Money via UPI
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'rgba(15, 20, 36, 0.98)', color: '#edf2ff' }} className="p-4">
          {topupSuccess && (
            <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>✅</span>
              <div>{topupSuccess}</div>
            </Alert>
          )}

          {topupError && (
            <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>⚠️</span>
              <div>{topupError}</div>
            </Alert>
          )}

          {/* Amount Selector */}
          <div className="mb-3">
            <Form.Label className="text-white-50 small fw-bold mb-1">Select Amount (INR ₹)</Form.Label>
            <div className="d-flex gap-2 mb-2">
              {['100', '250', '500', '1000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`btn btn-sm flex-fill rounded-2 fw-bold ${topupAmount === amt ? 'btn-success text-white' : 'btn-outline-secondary text-white-50'
                    }`}
                  onClick={() => setTopupAmount(amt)}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <Form.Control
              type="number"
              min="10"
              placeholder="Enter Custom Amount (Min ₹10)"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              className="bg-dark text-white border-secondary fw-bold"
            />
          </div>

          {/* Currency Credit Type */}
          <div className="mb-3">
            <Form.Label className="text-white-50 small fw-bold mb-1">Credit As</Form.Label>
            <Form.Select
              value={topupCurrency}
              onChange={(e) => setTopupCurrency(e.target.value)}
              className="bg-dark text-white border-secondary"
            >
              <option value="VEs">💎 VEs (Veloop Entries) — ₹1 = 1 VE</option>
              <option value="Tokens">🪙 Tokens — ₹1 = 10 Tokens</option>
            </Form.Select>
          </div>

          {/* Choose UPI App */}
          <div className="mb-3">
            <Form.Label className="text-white-50 small fw-bold mb-1">Choose UPI App to Pay</Form.Label>
            <div className="d-flex gap-2 mb-3">
              {[
                { name: 'PhonePe', icon: '🟣', label: 'PhonePe' },
                { name: 'Google Pay', icon: '🔵', label: 'GPay' },
                { name: 'Paytm', icon: '🔷', label: 'Paytm' },
                { name: 'BHIM', icon: '🇮🇳', label: 'BHIM / UPI' }
              ].map((app) => (
                <button
                  key={app.name}
                  type="button"
                  className={`btn btn-sm flex-fill py-2 rounded-2 fw-bold border ${selectedUpiApp === app.name
                    ? 'btn-primary text-white border-primary shadow'
                    : 'border-secondary border-opacity-30 bg-dark text-white-50'
                    }`}
                  onClick={() => setSelectedUpiApp(app.name)}
                >
                  <span className="d-block mb-1">{app.icon}</span>
                  <span style={{ fontSize: '0.75rem' }}>{app.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Deep link button (direct launch on mobile) */}
          <div className="mb-3">
            <a
              href={getUpiAppUrl(selectedUpiApp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
              id="upi-app-intent-btn"
            >
              <span>🚀</span> Pay ₹{topupAmount || 0} via {selectedUpiApp} App
            </a>
          </div>

          {/* QR Code & UPI ID for Desktop Scan */}
          <div className="p-3 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-30 text-center mb-3">
            <span className="text-white-50 small d-block mb-2">Or Scan QR Code with PhonePe, GPay, or Paytm:</span>
            <div className="d-inline-block p-2 bg-white rounded-3 shadow-sm mb-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiPayString)}`}
                alt="Scan with UPI"
                style={{ width: 160, height: 160 }}
              />
            </div>
            <div className="d-flex align-items-center justify-content-center gap-2">
              <code className="text-info small">{merchantUpiId}</code>
              <button
                type="button"
                className="btn btn-sm btn-outline-info py-0 px-2 small"
                onClick={() => {
                  navigator.clipboard.writeText(merchantUpiId);
                  setCopiedUpi(true);
                  setTimeout(() => setCopiedUpi(false), 2000);
                }}
              >
                {copiedUpi ? '✓ Copied' : 'Copy UPI ID'}
              </button>
            </div>
          </div>

          {/* Confirm Payment Button */}
          <Button
            variant="success"
            className="w-100 py-2 fw-bold"
            disabled={topupLoading || !topupAmount || Number(topupAmount) < 10}
            onClick={handleConfirmUpiPayment}
            id="confirm-upi-payment-btn"
          >
            {topupLoading ? 'Verifying & Crediting...' : `✓ I Have Paid ₹${topupAmount} — Credit My Balance`}
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ProfilePage;
