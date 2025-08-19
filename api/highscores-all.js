import { storage, requireEnv, json } from './_redis.js';

const SCORE_ZSET = 'scores:z';

export default async function handler(req, res) {
  try { 
    requireEnv(); 
  } catch (e) { 
    // No longer fatal - we'll use fallback storage
    console.warn('Redis env check:', e.message); 
  }
  
  try {
    // Fetch top 100 for extended rankings
    const entries = await storage.zrevrange(SCORE_ZSET, 0, 99, { withScores: true });
    const scores = [];
    for (let i = 0; i < entries.length; i += 2) {
      scores.push({ username: entries[i], score: Number(entries[i + 1]) });
    }
    return json(res, 200, { scores });
  } catch (error) {
    console.error('Failed to fetch extended leaderboard:', error);
    return json(res, 500, { error: 'Failed to fetch leaderboard data' });
  }
}
