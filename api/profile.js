import { storage, requireEnv, json, parseAuth } from './_redis.js';

const SCORE_ZSET = 'scores:z';

export default async function handler(req, res) {
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
    
    const score = await storage.zscore(SCORE_ZSET, username);
    return json(res, 200, { username, bestScore: score? Number(score):0 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return json(res, 500, { error: 'Failed to fetch profile' });
  }
}
