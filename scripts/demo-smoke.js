const baseUrl = process.env.DEMO_BASE_URL || 'http://localhost:3000';
const demoEmail = process.env.DEMO_EMAIL || '';
const demoPassword = process.env.DEMO_PASSWORD || '';

async function parseJson(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function fail(message) {
  console.error(`SMOKE FAILED: ${message}`);
  process.exit(1);
}

async function checkHealth() {
  const response = await fetch(`${baseUrl}/healthz`);
  if (!response.ok) {
    fail(`/healthz returned ${response.status}`);
  }
}

async function checkSearchApi() {
  const response = await fetch(`${baseUrl}/api/search/talents?page=1&limit=3`);
  if (!response.ok) {
    fail(`/api/search/talents returned ${response.status}`);
  }

  const payload = await parseJson(response);
  if (!payload || !Array.isArray(payload.results)) {
    fail('/api/search/talents payload is invalid');
  }
}

async function checkNotificationsWithLogin() {
  if (!demoEmail || !demoPassword) {
    console.log('SMOKE INFO: DEMO_EMAIL/DEMO_PASSWORD not set, protected checks skipped.');
    return;
  }

  const loginResponse = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email: demoEmail,
      password: demoPassword,
    }),
    redirect: 'manual',
  });

  if (loginResponse.status !== 302) {
    fail(`/login returned ${loginResponse.status} instead of 302`);
  }

  const setCookie = loginResponse.headers.get('set-cookie');
  if (!setCookie || !setCookie.includes('token=')) {
    fail('login did not return token cookie');
  }

  const tokenCookie = setCookie.split(';')[0];
  const notifResponse = await fetch(`${baseUrl}/api/notifications/count`, {
    headers: {
      Cookie: tokenCookie,
      Accept: 'application/json',
    },
  });

  if (!notifResponse.ok) {
    fail(`/api/notifications/count returned ${notifResponse.status}`);
  }

  const notifPayload = await parseJson(notifResponse);
  if (!notifPayload || typeof notifPayload.count !== 'number') {
    fail('/api/notifications/count payload is invalid');
  }
}

async function run() {
  console.log(`SMOKE START on ${baseUrl}`);
  await checkHealth();
  await checkSearchApi();
  await checkNotificationsWithLogin();
  console.log('SMOKE OK');
}

run().catch((error) => {
  fail(error?.message || 'Unexpected error');
});
