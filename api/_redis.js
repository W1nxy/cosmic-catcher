import { Redis } from '@upstash/redis';
import { fallbackStorage } from './_storage.js';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Check if Redis is available
export function isRedisAvailable() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// Smart storage that uses Redis when available, fallback storage when not
export const storage = {
  async hget(key, field) {
    if (isRedisAvailable()) {
      try {
        return await redis.hget(key, field);
      } catch (error) {
        console.warn('Redis hget failed, using fallback:', error.message);
      }
    }
    return fallbackStorage.hget(key, field);
  },

  async hset(key, data) {
    if (isRedisAvailable()) {
      try {
        return await redis.hset(key, data);
      } catch (error) {
        console.warn('Redis hset failed, using fallback:', error.message);
      }
    }
    return fallbackStorage.hset(key, data);
  },

  async exists(key) {
    if (isRedisAvailable()) {
      try {
        return await redis.exists(key);
      } catch (error) {
        console.warn('Redis exists failed, using fallback:', error.message);
      }
    }
    return fallbackStorage.exists(key);
  },

  async set(key, value, options) {
    if (isRedisAvailable()) {
      try {
        return await redis.set(key, value, options);
      } catch (error) {
        console.warn('Redis set failed, using fallback:', error.message);
      }
    }
    return fallbackStorage.set(key, value, options);
  },

  async get(key) {
    if (isRedisAvailable()) {
      try {
        return await redis.get(key);
      } catch (error) {
        console.warn('Redis get failed, using fallback:', error.message);
      }
    }
    return fallbackStorage.get(key);
  },

  async zadd(setName, data) {
    if (isRedisAvailable()) {
      try {
        return await redis.zadd(setName, data);
      } catch (error) {
        console.warn('Redis zadd failed, using fallback:', error.message);
      }
    }
    return fallbackStorage.zadd(setName, data);
  },

  async zscore(setName, member) {
    if (isRedisAvailable()) {
      try {
        return await redis.zscore(setName, member);
      } catch (error) {
        console.warn('Redis zscore failed, using fallback:', error.message);
      }
    }
    return fallbackStorage.zscore(setName, member);
  },

  async zrevrange(setName, start, stop, options) {
    if (isRedisAvailable()) {
      try {
        return await redis.zrevrange(setName, start, stop, options);
      } catch (error) {
        console.warn('Redis zrevrange failed, using fallback:', error.message);
      }
    }
    return fallbackStorage.zrevrange(setName, start, stop, options);
  }
};

export function requireEnv() {
  // No longer throw error, just warn if Redis isn't available
  if (!isRedisAvailable()) {
    console.warn('Redis not available, using fallback storage');
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
