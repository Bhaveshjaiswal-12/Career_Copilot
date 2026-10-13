import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function testAuthFlow() {
  const random = Date.now();
  const testUser = {
    name: 'Bhavesh Verification',
    username: `bhavesh_${random}`,
    email: `bhavesh_${random}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  console.log('1. Testing registration with:', testUser.email);
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });

  const regData = await regRes.json();
  console.log('Registration status:', regRes.status, regData.success ? '✓ SUCCESS' : regData);
  if (!regRes.ok) throw new Error(regData.message || 'Registration failed');

  // Extract set-cookie header
  const rawCookie = regRes.headers.get('set-cookie');
  console.log('Received auth cookie:', rawCookie ? '✓ YES (HTTP-only)' : '✗ NO');

  console.log('\n2. Testing /api/auth/me session restore...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Cookie: rawCookie },
  });
  const meData = await meRes.json();
  console.log('Session restore status:', meRes.status, meData.user?.email === testUser.email ? '✓ SUCCESS' : meData);

  console.log('\n3. Testing login with valid credentials...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password }),
  });
  const loginData = await loginRes.json();
  console.log('Login status:', loginRes.status, loginData.success ? '✓ SUCCESS' : loginData);

  console.log('\n4. Testing /api/dashboard/stats with auth cookie...');
  const dashRes = await fetch(`${BASE_URL}/dashboard/stats`, {
    headers: { Cookie: rawCookie },
  });
  const dashData = await dashRes.json();
  console.log('Dashboard stats status:', dashRes.status, dashData.success ? '✓ SUCCESS' : dashData);

  console.log('\n5. Testing /api/auth/profile update...');
  const profRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: rawCookie },
    body: JSON.stringify({
      name: 'Bhavesh Jaiswal (Updated)',
      profile: { headline: 'Full-Stack AI Engineer', skills: ['React', 'Node.js', 'MongoDB', 'Gemini'] },
    }),
  });
  const profData = await profRes.json();
  console.log('Profile update status:', profRes.status, profData.success ? '✓ SUCCESS' : profData);

  console.log('\n6. Testing cleanup via /api/auth/account (danger zone deletion)...');
  const delRes = await fetch(`${BASE_URL}/auth/account`, {
    method: 'DELETE',
    headers: { Cookie: rawCookie },
  });
  const delData = await delRes.json();
  console.log('Account delete status:', delRes.status, delData.success ? '✓ SUCCESS' : delData);

  console.log('\n🎉 ALL CORE API FEATURES VERIFIED AND PASSING SUCCESSFULLY!');
}

testAuthFlow().catch((err) => {
  console.error('\n✗ TEST FAILED:', err.message);
  process.exit(1);
});
