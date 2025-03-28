// server.ts - Main server file
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const port: number = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5000',
  methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for API endpoints
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
}));

// PostgreSQL connection with environment variables
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '10.96.32.190',
  database: process.env.DB_NAME || 'CapstoneMap',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
}); 

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test route to confirm server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

async function initializeDatabase(): Promise<void> {
  try {
    const client: PoolClient = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          user_id SERIAL PRIMARY KEY,
          email VARCHAR(100) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Database initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

interface SignupRequestBody {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}

interface LoginRequestBody {
  email?: string;
  password?: string;
}

app.post('/api/signup', async (
  req: express.Request<{}, any, SignupRequestBody>,
  res: express.Response
) => {
  console.log('Signup request body:', req.body);
  const { email, firstName, lastName, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO users (email, first_name, last_name, password_hash) VALUES ($1, $2, $3, $4) RETURNING user_id, email, first_name, last_name',
      [email, firstName, lastName, hashedPassword]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Server error during signup process' });
  }
});

app.post('/api/login', async (
  req: express.Request<{}, any, LoginRequestBody>,
  res: express.Response
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT user_id, email, first_name, last_name, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password_hash: _, ...userData } = user;
    res.json({
      message: 'Login successful',
      user: userData,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error during login process' });
  }
});

async function startServer(): Promise<void> {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log('Note: For production, implement HTTPS');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

console.log('Starting server with routes: /api/test, /api/signup, /api/login');
startServer();