import express from 'express';
import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Health check
app.get('/health', (_, res) => res.send('ok'));

// Students endpoints (repeat similarly for others)
app.get('/api/students', async (_, res) => {
  const { rows } = await pool.query('SELECT * FROM students ORDER BY id');
  res.json(rows);
});

app.post('/api/students', async (req, res) => {
  const { name, gender, birthdate, parent, contact } = req.body;
  const qry = `INSERT INTO students(name, gender, birthdate, parent, contact)
               VALUES($1,$2,$3,$4,$5) RETURNING *`;
  const { rows } = await pool.query(qry, [name, gender, birthdate, parent, contact]);
  res.status(201).json(rows[0]);
});

// Repeat endpoints for teachers, courses, payments, etc.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
