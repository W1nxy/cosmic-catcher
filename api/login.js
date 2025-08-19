import { storage, requireEnv, hashPassword, json, createToken } from './_redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  
  try { 
    requireEnv(); 
  } catch (e) { 
    // No longer fatal - we'll use fallback storage
    console.warn('Redis env check:', e.message); 
  }
  
  try {
    let body='';
    for await (const chunk of req) body += chunk;
    const { username, password } = JSON.parse(body||'{}');
    if (!username || !password) return json(res, 400, { error: 'Missing credentials' });
    
    const key = `user:${username}`;
    const passHash = await storage.hget(key, 'passHash');
    const salt = await storage.hget(key, 'salt');
    if (!passHash || !salt) return json(res, 400, { error: 'Invalid login' });
    
    const inputHash = await hashPassword(password + salt);
    if (inputHash !== passHash) return json(res, 400, { error: 'Invalid login' });
    
    const token = createToken(username);
    await storage.set(`session:${token}`, username, { ex: 60*60*24 });
    return json(res, 200, { token });
  } catch (error) {
    console.error('Login error:', error);
    return json(res, 500, { error: 'Login failed' });
  }
}
