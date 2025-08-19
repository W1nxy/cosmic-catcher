import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export function requireEnv() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Missing Upstash Redis env vars');
  }
}

export function hashPassword(pw) {
  // Simple hash (not secure) -> for demo only. In production use bcrypt/argon2 on server.
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(pw)).then(buf => {
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  });
}

export async function verifyPassword(pw, hash) {
  return (await hashPassword(pw)) === hash;
}

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify(body));
}

export function createToken(username) {
  // naive token
  return Buffer.from(`${username}:${Date.now()}:${Math.random().toString(36).slice(2)}`).toString('base64');
}

export function parseAuth(req) {
  const auth = req.headers['authorization'];
  if (!auth) return null;
  const [,token] = auth.split(' ');
  if (!token) return null;
  try {
    const raw = Buffer.from(token,'base64').toString();
    const username = raw.split(':')[0];
    return { username, token };
  } catch { return null; }
}
