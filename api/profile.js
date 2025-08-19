import { redis, requireEnv, json, parseAuth } from './_redis.js';

const SCORE_ZSET = 'scores:z';

export default async function handler(req, res) {
  try { requireEnv(); } catch (e) { return json(res, 500, { error: e.message }); }
  const auth = parseAuth(req);
  if (!auth) return json(res, 401, { error: 'Unauthorized' });
  const username = await redis.get(`session:${auth.token}`);
  if (!username) return json(res, 401, { error: 'Invalid session' });
  const score = await redis.zscore(SCORE_ZSET, username);
  return json(res, 200, { username, bestScore: score? Number(score):0 });
}
