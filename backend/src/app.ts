import cors from 'cors';
import express from 'express';
import { pool } from './db/pool.js';
import { INSPECT_MAX_BYTES } from 'buffer';

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.get('/api/items', async (req, res) => {
  try{
    const result =  await pool.query(`SELECT id,title,description, category, status, created_at, updated_at
      FROM items 
      ORDER BY created_at DESC`
    );
    
    const data = result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }));

    res.json({
      data,
      total:data.length,
      page:1,
      limit:10,
      totalPages:1
    })
  }catch(error){
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
})

app.post('/api/items', async(req,res) => {
  try{
    const {title,description,category,status} = req.body;

    const result = await pool.query(`INSERT INTO items (title,description,category,status) VALUES ($1,$2,$3,$4) RETURNING *`,[title,description,category,status]);

    const row = result.rows[0];

    res.status(201).json({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })
  }catch(err){
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
})

// Check DB on startup — pool.query is async, so we must await before app.listen
try {
  await pool.query('SELECT 1');
  console.log('Database connected successfully');
} catch (error) {
  console.error('Database connection failed:', error);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
