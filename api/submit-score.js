import { storage, requireEnv, json, parseAuth } from './_redis.js';

const SCORE_ZSET = 'scores:z';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  
  try { 
    requireEnv(); 
  } catch (e) { 
    // No longer fatal - we'll use fallback storage
    console.warn('Redis env check:', e.message); 
  }
  
  const auth = parseAuth(req);
  if (!auth) return json(res, 401, { error: 'Unauthorized' });
  
  try {
    const username = await storage.get(`session:${auth.token}`);
    if (!username) return json(res, 401, { error: 'Invalid session' });
    
    let body='';
    for await (const chunk of req) body += chunk;
    const { score } = JSON.parse(body||'{}');
    if (typeof score !== 'number') return json(res, 400, { error: 'Invalid score' });
    
    // store if higher
    const existing = await storage.zscore(SCORE_ZSET, username);
    if (!existing || score > Number(existing)) {
      await storage.zadd(SCORE_ZSET, { score, member: username });
    }
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('Submit score error:', error);
    return json(res, 500, { error: 'Failed to submit score' });
  }
}
