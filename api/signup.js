import { redis, requireEnv, hashPassword, json } from './_redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try { requireEnv(); } catch (e) { return json(res, 500, { error: e.message }); }
  let body = '';
  for await (const chunk of req) body += chunk;
  const { username, password } = JSON.parse(body||'{}');
  if (!username || !password) return json(res, 400, { error: 'Missing credentials' });
  const key = `user:${username}`;
  if (await redis.exists(key)) return json(res, 400, { error: 'User exists' });
  const passHash = await hashPassword(password);
  await redis.hset(key, { passHash, created: Date.now() });
  return json(res, 200, { ok: true });
}
