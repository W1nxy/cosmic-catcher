import { redis, requireEnv, hashPassword, json, createToken } from './_redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try { requireEnv(); } catch (e) { return json(res, 500, { error: e.message }); }
  let body='';
  for await (const chunk of req) body += chunk;
  const { username, password } = JSON.parse(body||'{}');
  if (!username || !password) return json(res, 400, { error: 'Missing credentials' });
  const key = `user:${username}`;
  const passHash = await redis.hget(key, 'passHash');
  const salt = await redis.hget(key, 'salt');
  if (!passHash || !salt) return json(res, 400, { error: 'Invalid login' });
  const inputHash = await hashPassword(password + salt);
  if (inputHash !== passHash) return json(res, 400, { error: 'Invalid login' });
  const token = createToken(username);
  await redis.set(`session:${token}`, username, { ex: 60*60*24 });
  return json(res, 200, { token });
}
