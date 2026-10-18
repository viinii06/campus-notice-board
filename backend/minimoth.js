// Thin wrapper around the Minimoth OTP API (https://minimoth.dev/docs).
const BASE_URL = process.env.MINIMOTH_BASE_URL || 'https://api.minimoth.dev';

export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

async function call(path, body) {
  const apiKey = process.env.MINIMOTH_API_KEY;
  if (!apiKey) throw httpError(500, 'MINIMOTH_API_KEY is missing from backend .env');

  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
      body: JSON.stringify(body),
    });
  } catch {
    throw httpError(502, 'Could not reach the OTP service. Try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Pass user-facing errors through (wrong code, bad phone, rate limit); hide the rest.
    const userFacing = [400, 422, 429].includes(res.status);
    console.error('Minimoth error:', res.status, data);
    throw httpError(userFacing ? res.status : 502, userFacing ? data.error : 'OTP service error. Try again later.');
  }
  return data;
}

export const sendOtp = (phone) => call('/v1/otp/send', { phone });
export const verifyOtp = (phone, code) => call('/v1/otp/verify', { phone, code });
