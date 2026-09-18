const BASE_URL = 'http://localhost:5000/api';

async function testWinningRewardsDelivery() {
  console.log('--- Starting Winning Rewards Delivery Verification ---');

  // 1. Register a test user
  const email = `deliver_user_${Date.now()}@veloop.test`;
  const phone = `97${Math.floor(10000000 + Math.random() * 90000000)}`;
  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Sharma',
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

  // 2. Test GET /api/auth/my-winning-rewards
  console.log('\n--- Testing GET /api/auth/my-winning-rewards ---');
  const winningsRes = await fetch(`${BASE_URL}/auth/my-winning-rewards`, { headers });
  const winningsData = await winningsRes.json();
  if (!winningsRes.ok) throw new Error(winningsData.message || 'Failed to fetch winning rewards');
  console.log('✓ Winning rewards catalog fetched successfully:');
  console.log('  Physical Gifts count:', winningsData.data.catalog.gifts.length);
  console.log('  Gift Vouchers count:', winningsData.data.catalog.vouchers.length);

  // 3. Test Delivering a Physical Gift (4-Day Delivery to Address - NO COINS REQUIRED)
  console.log('\n--- Testing Physical Gift Delivery (No coins required) ---');
  const giftRes = await fetch(`${BASE_URL}/auth/deliver-reward`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      rewardTitle: 'Apple iPhone 15 Pro (128GB)',
      rewardType: 'PHYSICAL_GIFT',
      shippingAddress: {
        recipientName: 'Priya Sharma',
        phone: '9765432100',
        address: 'Villa 14, Lotus Boulevard, Sector 100',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pin: '201304'
      }
    })
  });
  const giftData = await giftRes.json();
  if (!giftRes.ok) throw new Error(giftData.message || 'Physical gift delivery failed');
  console.log('✓ Physical gift delivery order placed successfully!');
  console.log('  Tracking Number:', giftData.trackingNumber);
  console.log('  Guaranteed Delivery Days:', giftData.deliveryDays);
  console.log('  Expected Delivery Date:', giftData.expectedDeliveryDate);
  console.log('  Shipping Address:', giftData.shippingAddress);

  if (!giftData.trackingNumber || !giftData.trackingNumber.endsWith('-4D')) {
    throw new Error('Tracking number is missing express -4D suffix');
  }

  // 4. Test Delivering a Gift Voucher / Card (Generates Card Code + 4-Day Address Delivery)
  console.log('\n--- Testing Gift Voucher / Card Delivery ---');
  const voucherRes = await fetch(`${BASE_URL}/auth/deliver-reward`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      rewardTitle: 'Amazon Shopping Gift Card (₹5,000 / $100)',
      rewardType: 'GIFT_VOUCHER',
      shippingAddress: {
        recipientName: 'Priya Sharma',
        phone: '9765432100',
        address: 'Villa 14, Lotus Boulevard, Sector 100',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pin: '201304'
      }
    })
  });
  const voucherData = await voucherRes.json();
  if (!voucherRes.ok) throw new Error(voucherData.message || 'Voucher delivery failed');
  console.log('✓ Gift voucher/card order placed successfully!');
  console.log('  Reward:', voucherData.rewardTitle);
  console.log('  Voucher Card Code:', voucherData.voucherCode);
  console.log('  Tracking Number:', voucherData.trackingNumber);
  console.log('  Expected Delivery:', voucherData.expectedDeliveryDate);

  if (!voucherData.voucherCode) {
    throw new Error('Expected a generated voucher code for gift voucher delivery');
  }

  // 5. Test Validation: Missing address fields
  console.log('\n--- Testing Validation: Missing address fields ---');
  const invalidRes = await fetch(`${BASE_URL}/auth/deliver-reward`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      rewardTitle: 'Smart Watch Fitness Series 9',
      rewardType: 'PHYSICAL_GIFT',
      shippingAddress: {
        recipientName: 'Priya Sharma'
        // Missing phone, address, city, state, pin
      }
    })
  });
  const invalidData = await invalidRes.json();
  if (invalidRes.status === 400) {
    console.log('✓ Correctly rejected incomplete address with 400:', invalidData.message);
  } else {
    throw new Error(`Expected 400, got ${invalidRes.status}`);
  }

  console.log('\n======================================================');
  console.log('ALL WINNING REWARDS DELIVERY VERIFICATION TESTS PASSED!');
  console.log('======================================================');
}

testWinningRewardsDelivery().catch((err) => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
