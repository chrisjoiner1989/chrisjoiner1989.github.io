/**
 * Database Configuration
 * PostgreSQL connection and setup
 */

const { Pool } = require('pg');

// Database connection configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mount_builder',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(config);

// Test connection
pool.on('connect', () => {
  console.log('✓ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Execute a query
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  if (duration > 100) {
    console.warn(`Slow query (${duration}ms): ${text}`);
  }

  return res;
}

/**
 * Get a client from the pool for transactions
 */
async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 5 seconds for queries
  const timeout = setTimeout(() => {
    console.error('Client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the query method to track release
  client.query = (...args) => {
    return query.apply(client, args);
  };

  // Monkey patch the release method to clear timeout
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
}

/**
 * Initialize database schema
 */
async function initializeSchema() {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    console.log('Creating database schema...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `);

    // Sermons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sermons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        speaker VARCHAR(255) DEFAULT 'Guest Speaker',
        date DATE NOT NULL,
        series VARCHAR(255) DEFAULT 'General',
        notes TEXT,
        verse_reference VARCHAR(255),
        verse_data JSONB,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for sermons
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sermons_user ON sermons(user_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons(date)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sermons_series ON sermons(series)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sermons_tags ON sermons USING GIN(tags)
    `);

    // Full-text search index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sermons_fulltext ON sermons
      USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(notes, '')))
    `);

    // Bible cache table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bible_cache (
        id SERIAL PRIMARY KEY,
        book VARCHAR(50) NOT NULL,
        chapter INTEGER NOT NULL,
        translation VARCHAR(10) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        last_accessed TIMESTAMP DEFAULT NOW(),
        access_count INTEGER DEFAULT 1,
        UNIQUE(book, chapter, translation)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bible_cache_lookup
      ON bible_cache(book, chapter, translation)
    `);

    // User preferences
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'light',
        font_size VARCHAR(20) DEFAULT 'medium',
        preferences JSONB,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Performance metrics (optional)
    await client.query(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        metric_name VARCHAR(50) NOT NULL,
        value NUMERIC NOT NULL,
        page VARCHAR(50),
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_perf_user_time
      ON performance_metrics(user_id, timestamp)
    `);

    await client.query('COMMIT');
    console.log('✓ Database schema initialized successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check if database is ready
 */
async function checkConnection() {
  try {
    const result = await query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

module.exports = {
  query,
  getClient,
  initializeSchema,
  checkConnection,
  pool
};
