const BASE_URL = 'http://localhost:5000/api';

async function testUpiAddMoney() {
  console.log('--- Starting UPI Add Money (PhonePe, Google Pay, Paytm) Verification ---');

  // 1. Register a test user
  const email = `upi_user_${Date.now()}@veloop.test`;
  const phone = `96${Math.floor(10000000 + Math.random() * 90000000)}`;
  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Mehra',
      email,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      phone
    })
  });
  const registerData = await registerRes.json();
  if (!registerRes.ok) throw new Error(registerData.message || JSON.stringify(registerData));

  // Verify email token
  const url = new URL(registerData.verificationLink);
  const verificationToken = url.searchParams.get('token');
  const verifyRes = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: verificationToken })
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok) throw new Error('Email verification failed');
  const token = verifyData.token;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  console.log('✓ Registered & verified test user:', email);

  // Check initial balance
  const meRes = await fetch(`${BASE_URL}/auth/me`, { headers });
  const meData = await meRes.json();
  console.log('Initial wallet balances:', meData.user.balances);
  const initialVEs = meData.user.balances.VEs || 0;
  const initialTokens = meData.user.balances.Tokens || 0;

  // 2. Test PhonePe UPI Add Money (₹250 -> 250 VEs)
  console.log('\n--- Testing PhonePe UPI Top-Up ---');
  const phonepeRes = await fetch(`${BASE_URL}/auth/add-money-upi`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      amount: 250,
      currency: 'VEs',
      upiApp: 'PhonePe',
      utrNumber: 'UPI-PP-872910398412'
    })
  });
  const phonepeData = await phonepeRes.json();
  if (!phonepeRes.ok) throw new Error(phonepeData.message || 'PhonePe top-up failed');
  console.log('✓ PhonePe top-up successful!');
  console.log('  Message:', phonepeData.message);
  console.log('  Txn ID:', phonepeData.txnId);
  console.log('  New Balances:', phonepeData.balances);

  if (phonepeData.balances.VEs !== initialVEs + 250) {
    throw new Error(`Expected VEs to be ${initialVEs + 250}, got ${phonepeData.balances.VEs}`);
  }

  // 3. Test Google Pay UPI Add Money (₹100 -> 1,000 Tokens)
  console.log('\n--- Testing Google Pay UPI Top-Up ---');
  const gpayRes = await fetch(`${BASE_URL}/auth/add-money-upi`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      amount: 100,
      currency: 'Tokens',
      upiApp: 'Google Pay',
      utrNumber: 'UPI-GPAY-984719284102'
    })
  });
  const gpayData = await gpayRes.json();
  if (!gpayRes.ok) throw new Error(gpayData.message || 'GPay top-up failed');
  console.log('✓ Google Pay top-up successful!');
  console.log('  Message:', gpayData.message);
  console.log('  New Balances:', gpayData.balances);

  if (gpayData.balances.Tokens !== initialTokens + 1000) {
    throw new Error(`Expected Tokens to be ${initialTokens + 1000}, got ${gpayData.balances.Tokens}`);
  }

  // 4. Test Paytm UPI Add Money (₹500 -> 500 VEs)
  console.log('\n--- Testing Paytm UPI Top-Up ---');
  const paytmRes = await fetch(`${BASE_URL}/auth/add-money-upi`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      amount: 500,
      currency: 'VEs',
      upiApp: 'Paytm',
      utrNumber: 'UPI-PAYTM-671829038419'
    })
  });
  const paytmData = await paytmRes.json();
  if (!paytmRes.ok) throw new Error(paytmData.message || 'Paytm top-up failed');
  console.log('✓ Paytm top-up successful!');
  console.log('  Message:', paytmData.message);
  console.log('  New Balances:', paytmData.balances);

  // 5. Test Validation: Minimum amount check
  console.log('\n--- Testing Validation (Min Amount) ---');
  const invalidRes = await fetch(`${BASE_URL}/auth/add-money-upi`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      amount: 5, // Below ₹10
      currency: 'VEs',
      upiApp: 'PhonePe'
    })
  });
  const invalidData = await invalidRes.json();
  if (invalidRes.status === 400) {
    console.log('✓ Correctly rejected below min amount (400):', invalidData.message);
  } else {
    throw new Error(`Expected 400, got ${invalidRes.status}`);
  }

  console.log('\n======================================================');
  console.log('ALL UPI ADD MONEY (PHONEPE, GPAY, PAYTM) TESTS PASSED!');
  console.log('======================================================');
}

testUpiAddMoney().catch((err) => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
