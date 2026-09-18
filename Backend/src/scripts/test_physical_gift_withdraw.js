const BASE_URL = 'http://localhost:5000/api';

async function testPhysicalGiftWithdrawal() {
  console.log('--- Starting Physical Gift Withdrawal Verification ---');

  // 1. Register a test user
  const email = `giftuser_${Date.now()}@veloop.test`;
  const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alex Mercer',
      email,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      phone
    })
  });
  const registerData = await registerRes.json();
  if (!registerRes.ok) throw new Error(registerData.message || JSON.stringify(registerData));
  console.log('Register response:', registerData.message);

  let token = registerData.token;
  if (!token && registerData.verificationLink) {
    const url = new URL(registerData.verificationLink);
    const verificationToken = url.searchParams.get('token');
    const verifyRes = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: verificationToken })
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(verifyData.message || 'Verification failed');
    console.log('✓ Email verified successfully:', verifyData.message);
    token = verifyData.token;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // 2. Add balance for testing using redeem code
  const redeemRes = await fetch(`${BASE_URL}/auth/redeem-code`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code: 'VELOOP2026' })
  });
  const redeemData = await redeemRes.json();
  console.log('✓ Redeemed promotional code VELOOP2026:', redeemData.reward);

  // Check balance
  const meRes = await fetch(`${BASE_URL}/auth/me`, { headers });
  const meData = await meRes.json();
  console.log('Current balance:', meData.user?.balances);

  // 3. Test Physical Gift Withdrawal (4-Day Delivery)
  console.log('\n--- Testing 4-Day Physical Gift Withdrawal ---');
  const physicalGiftPayload = {
    withdrawalType: 'PHYSICAL_GIFT',
    currencyType: 'VEs',
    amount: 500,
    giftItem: 'Apple iPhone 15 Pro (128GB)',
    shippingAddress: {
      recipientName: 'Alex Mercer',
      phone: '9876543210',
      address: 'Plot 42, Silicon Heights, Tech Park Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pin: '560100'
    }
  };

  const withdrawRes = await fetch(`${BASE_URL}/auth/withdraw`, {
    method: 'POST',
    headers,
    body: JSON.stringify(physicalGiftPayload)
  });
  const withdrawData = await withdrawRes.json();

  if (!withdrawRes.ok) {
    throw new Error(withdrawData.message || 'Physical gift withdrawal failed');
  }

  console.log('✓ Physical gift withdrawal successful!');
  console.log('Response Status:', withdrawRes.status);
  console.log('Order Details:', {
    trackingNumber: withdrawData.trackingNumber,
    giftItem: withdrawData.giftItem,
    expectedDeliveryDate: withdrawData.expectedDeliveryDate,
    deliveryDays: withdrawData.deliveryDays,
    shippingAddress: withdrawData.shippingAddress
  });

  if (!withdrawData.trackingNumber || !withdrawData.trackingNumber.endsWith('-4D')) {
    throw new Error('Tracking number does not have 4D express delivery suffix');
  }

  if (withdrawData.deliveryDays !== 4) {
    throw new Error('Delivery days is not guaranteed 4 days');
  }

  console.log('\n--- Testing Validation: Missing Shipping Address ---');
  const invalidRes = await fetch(`${BASE_URL}/auth/withdraw`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      withdrawalType: 'PHYSICAL_GIFT',
      currencyType: 'VEs',
      amount: 100,
      giftItem: 'Smart Fitness Watch'
      // Missing shippingAddress
    })
  });
  const invalidData = await invalidRes.json();
  if (invalidRes.status === 400) {
    console.log('✓ Correctly rejected missing address (400):', invalidData.message);
  } else {
    throw new Error(`Expected 400 for missing address, got ${invalidRes.status}`);
  }

  console.log('\n--- Testing Money / UPI Withdrawal ---');
  const moneyRes = await fetch(`${BASE_URL}/auth/withdraw`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      withdrawalType: 'MONEY',
      currency: 'VEs',
      amount: 100,
      payoutMethod: 'UPI',
      destination: 'alex@okhdfcbank'
    })
  });
  const moneyData = await moneyRes.json();
  if (!moneyRes.ok) {
    throw new Error(moneyData.message || 'Money withdrawal failed');
  }
  console.log('✓ Money withdrawal successful! Message:', moneyData.message, 'Balances:', moneyData.balances);

  console.log('\n=============================================');
  console.log('ALL PHYSICAL & MONEY WITHDRAWAL TESTS PASSED!');
  console.log('=============================================');
}

testPhysicalGiftWithdrawal().catch((err) => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
