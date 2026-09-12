import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const testPort = process.env.API_PORT || '5000';
const baseUrl = process.env.API_BASE_URL || `http://localhost:${testPort}/api`;
const testClientId = `api-test-${Date.now()}`;
let serverProcess;
let ownsServer = false;

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', 'x-client-id': testClientId, ...(options.headers || {}) }
  });
  const data = await response.json();
  return { response, data };
};

const waitForApi = async (timeoutMs = 120000) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // The backend may still be connecting to MongoDB.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`API did not become available at ${baseUrl}`);
};

const ensureApi = async () => {
  try {
    await waitForApi(1000);
    return;
  } catch {
    const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const serverEntry = path.join(backendRoot, 'server.js');
    serverProcess = spawn(process.execPath, [serverEntry], {
      cwd: backendRoot,
      env: { ...process.env, PORT: testPort },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });
    ownsServer = true;
    let startupError = '';
    let childExitCode;
    serverProcess.stderr.on('data', (chunk) => {
      startupError += chunk.toString();
    });
    serverProcess.on('exit', (code) => {
      childExitCode = code;
    });
    await waitForApi();
    if (childExitCode !== undefined && childExitCode !== 0) {
      throw new Error(startupError || `Backend exited during startup with code ${childExitCode}.`);
    }
  }
};

test.before(async () => {
  await ensureApi();
});

test.after(() => {
  if (ownsServer && serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});

test('health and giveaway history endpoints are available', async () => {
  const health = await request('/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.data.success, true);

  const giveaways = await request('/giveaways');
  assert.equal(giveaways.response.status, 200);
  assert.match(giveaways.data.data[0].giveawayCode, /^GW-\d{3}$/);

  const previous = await request('/giveaways/previous');
  assert.equal(previous.response.status, 200);
  assert.equal(previous.data.success, true);
});

test('authentication rejects invalid credentials and returns a protected identity', async () => {
  const invalid = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'test@example.com', password: 'wrong-password' })
  });
  assert.equal(invalid.response.status, 401);

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'test@example.com', password: 'secret123' })
  });
  assert.equal(login.response.status, 200);

  const me = await request('/auth/me', { headers: { authorization: `Bearer ${login.data.token}` } });
  assert.equal(me.response.status, 200);
  assert.equal(me.data.user.email, 'test@example.com');
});

test('mobile OTP authentication workflow sends OTP and verifies session with strict validation', async () => {
  // 1. Invalid phone number rejection
  const invalidPhone = await request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone: '123' })
  });
  assert.equal(invalidPhone.response.status, 400);

  // 2. Valid phone number acceptance
  const phone = '+919876543210';
  const sendRes = await request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone })
  });
  assert.equal(sendRes.response.status, 200);
  assert.equal(sendRes.data.success, true);
  assert.ok(sendRes.data.otp);

  // 3. Invalid OTP format rejection (must be 6 digits)
  const badFormat = await request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp: '12' })
  });
  assert.equal(badFormat.response.status, 400);

  // 4. Incorrect OTP rejection
  const badVerify = await request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp: '000000' })
  });
  assert.equal(badVerify.response.status, 400);

  // 5. Successful OTP verification
  const goodVerify = await request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp: sendRes.data.otp })
  });
  assert.equal(goodVerify.response.status, 200);
  assert.ok(goodVerify.data.token);
  assert.equal(goodVerify.data.user.phone, phone);
  assert.ok(goodVerify.data.user.balances);

  const me = await request('/auth/me', { headers: { authorization: `Bearer ${goodVerify.data.token}` } });
  assert.equal(me.response.status, 200);
  assert.equal(me.data.user.phone, phone);
});

test('member cannot create an admin giveaway and duplicate join is rejected', async () => {
  const jwt = (await import('jsonwebtoken')).default;
  const token = jwt.sign(
    { id: `test-user-${Date.now()}`, email: 'tester@example.com', role: 'member' },
    process.env.JWT_SECRET || 'veloop-dev-secret',
    { expiresIn: '1h' }
  );
  const headers = { Authorization: `Bearer ${token}` };

  const forbidden = await request('/giveaways', {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: 'Unauthorized', prize: 'Test' })
  });
  assert.equal(forbidden.response.status, 403);

  const giveaways = await request('/giveaways');
  const active = giveaways.data.data.find((item) => ['iphone-15-pro', 'summer-elite-drop'].includes(item.slug) || ['live', 'ACTIVE', 'active'].includes(item.status));
  assert.ok(active, 'a live giveaway is required for this test');
  const body = JSON.stringify({ giveawayId: active._id, requestKey: `automated-${Date.now()}` });

  const userDeviceHeaders = {
    ...headers,
    'x-device-id': `test-device-${Date.now()}`
  };
  const join = await request('/participations/join', { method: 'POST', headers: userDeviceHeaders, body });
  assert.equal(join.response.status, 201, JSON.stringify(join.data));
  assert.equal(join.data.data.transaction.currency, active.entryRequirement?.currency || 'VEs');
  assert.equal(join.data.data.transaction.amount, active.entryRequirement?.amount || 200);

  const duplicate = await request('/participations/join', { method: 'POST', headers, body });
  assert.equal(duplicate.response.status, 409);
});

test('nested status and winner endpoints are protected by the same event contract', async () => {
  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'test@example.com', password: 'secret123' })
  });
  assert.equal(login.response.status, 200);
  const headers = { Authorization: `Bearer ${login.data.token}` };
  const giveaways = await request('/giveaways');
  const active = giveaways.data.data.find((item) => item.status === 'ACTIVE');
  assert.ok(active, 'an active giveaway is required for this test');

  const status = await request(`/giveaways/${active._id}/my-status`, { headers });
  assert.equal(status.response.status, 200);

  const winners = await request(`/giveaways/${active._id}/winners`);
  assert.equal(winners.response.status, 200);
  assert.equal(winners.data.success, true);

  const claim = await request(`/giveaways/${active._id}/my-claim`, { headers });
  assert.equal(claim.response.status, 200);
  assert.equal(claim.data.data, null);
});

test('configured admin can access admin actions', async () => {
  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.data.user.role, 'admin');

  const response = await request('/giveaways/seed', {
    method: 'POST',
    headers: { Authorization: `Bearer ${login.data.token}` },
    body: '{}'
  });
  assert.ok([200, 201].includes(response.response.status));
});

test('user registration validates input, prevents duplicates, hashes password, and enables login', async () => {
  const uniqueSuffix = Date.now();
  const testEmail = `newuser_${uniqueSuffix}@example.com`;
  const validPassword = 'SecurePassword123!';

  // 1. Missing fields rejection
  const missingFields = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test User', email: testEmail, password: validPassword })
  });
  assert.equal(missingFields.response.status, 400);

  // 2. Invalid email format rejection
  const invalidEmail = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test User', email: 'not-an-email', password: validPassword, confirmPassword: validPassword })
  });
  assert.equal(invalidEmail.response.status, 400);

  // 3. Password mismatch rejection
  const mismatch = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test User', email: testEmail, password: validPassword, confirmPassword: 'DifferentPassword' })
  });
  assert.equal(mismatch.response.status, 400);

  // 4. Short password rejection
  const shortPass = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test User', email: testEmail, password: '123', confirmPassword: '123' })
  });
  assert.equal(shortPass.response.status, 400);

  // 5. Successful registration
  const registered = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Jane Doe',
      email: testEmail,
      password: validPassword,
      confirmPassword: validPassword
    })
  });
  assert.equal(registered.response.status, 201);
  assert.equal(registered.data.success, true);
  assert.equal(registered.data.user.email, testEmail);
  assert.equal(registered.data.user.name, 'Jane Doe');
  assert.equal(registered.data.user.password, undefined);
  assert.equal(registered.data.user.passwordHash, undefined);

  // 6. Duplicate registration rejection (must not allow same email again)
  const duplicate = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Jane Clone',
      email: testEmail,
      password: validPassword,
      confirmPassword: validPassword
    })
  });
  assert.equal(duplicate.response.status, 409);

  // 7. Login with wrong password returns generic error without revealing field
  const wrongLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword' })
  });
  assert.equal(wrongLogin.response.status, 401);
  assert.equal(wrongLogin.data.message, 'Invalid email or password.');

  // 8. Login with non-existent email returns same generic error
  const ghostLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `ghost_${uniqueSuffix}@example.com`, password: validPassword })
  });
  assert.equal(ghostLogin.response.status, 401);
  assert.equal(ghostLogin.data.message, 'Invalid email or password.');

  // 9. Successful login with newly registered credentials
  const validLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: validPassword })
  });
  assert.equal(validLogin.response.status, 200);
  assert.ok(validLogin.data.token);
  assert.equal(validLogin.data.user.email, testEmail);
  assert.equal(validLogin.data.user.name, 'Jane Doe');

  // 10. Verify /auth/me returns valid session
  const me = await request('/auth/me', { headers: { authorization: `Bearer ${validLogin.data.token}` } });
  assert.equal(me.response.status, 200);
  assert.equal(me.data.user.email, testEmail);
});
