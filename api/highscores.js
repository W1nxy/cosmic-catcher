import { redis, requireEnv, json } from './_redis.js';

const SCORE_ZSET = 'scores:z';

export default async function handler(req, res) {
  try { requireEnv(); } catch (e) { return json(res, 500, { error: e.message }); }
  // top 10
  const entries = await redis.zrevrange(SCORE_ZSET, 0, 9, { withScores: true });
  const scores = [];
  for (let i=0;i<entries.length;i+=2) {
    scores.push({ username: entries[i], score: Number(entries[i+1]) });
  }
  return json(res, 200, { scores });
}
