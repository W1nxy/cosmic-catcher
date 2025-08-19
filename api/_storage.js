// Fallback in-memory storage when Redis is unavailable
// This provides basic functionality for the leaderboard even without Redis

let memoryStorage = {
  users: new Map(), // username -> { passHash, salt, created }
  sessions: new Map(), // token -> username
  scores: new Map(), // username -> score
};

// Fallback functions that mirror Redis API
export const fallbackStorage = {
  // User management
  async hget(key, field) {
    if (key.startsWith('user:')) {
      const username = key.replace('user:', '');
      const user = memoryStorage.users.get(username);
      return user?.[field] || null;
    }
    return null;
  },

  async hset(key, data) {
    if (key.startsWith('user:')) {
      const username = key.replace('user:', '');
      memoryStorage.users.set(username, data);
      return true;
    }
    return false;
  },

  async exists(key) {
    if (key.startsWith('user:')) {
      const username = key.replace('user:', '');
      return memoryStorage.users.has(username);
    }
    return false;
  },

  // Session management
  async set(key, value, options = {}) {
    if (key.startsWith('session:')) {
      memoryStorage.sessions.set(key, value);
      // In real implementation, would handle expiration
      if (options.ex) {
        setTimeout(() => {
          memoryStorage.sessions.delete(key);
        }, options.ex * 1000);
      }
      return true;
    }
    return false;
  },

  async get(key) {
    if (key.startsWith('session:')) {
      return memoryStorage.sessions.get(key) || null;
    }
    return null;
  },

  // Score management (simplified sorted set implementation)
  async zadd(setName, { score, member }) {
    if (setName === 'scores:z') {
      memoryStorage.scores.set(member, score);
      return true;
    }
    return false;
  },

  async zscore(setName, member) {
    if (setName === 'scores:z') {
      return memoryStorage.scores.get(member) || null;
    }
    return null;
  },

  async zrevrange(setName, start, stop, options = {}) {
    if (setName === 'scores:z') {
      const sortedEntries = Array.from(memoryStorage.scores.entries())
        .sort(([,a], [,b]) => b - a) // Sort by score descending
        .slice(start, stop + 1);
      
      if (options.withScores) {
        // Return flat array: [username1, score1, username2, score2, ...]
        return sortedEntries.flatMap(([username, score]) => [username, score]);
      }
      return sortedEntries.map(([username]) => username);
    }
    return [];
  }
};

// Populate with some initial demo data for better UX
memoryStorage.scores.set('CosmicMaster', 25420);
memoryStorage.scores.set('StarLegend', 18900);
memoryStorage.scores.set('GalaxyHero', 15200);
memoryStorage.scores.set('AstroChamp', 12850);
memoryStorage.scores.set('SpaceWizard', 10760);
memoryStorage.scores.set('NebulaKnight', 8650);
memoryStorage.scores.set('OrbitRunner', 7540);
memoryStorage.scores.set('CometCatcher', 6430);
memoryStorage.scores.set('StellarSage', 5320);
memoryStorage.scores.set('VoidWalker', 4210);