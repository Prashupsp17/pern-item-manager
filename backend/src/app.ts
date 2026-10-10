import cors from 'cors';
import express from 'express';
import { pool } from './db/pool.js';

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

interface ItemRow {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

function mapItem(row: ItemRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

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
  try {

    const search = String(req.query.search ?? '').trim();

    let queryText = `SELECT ID,TITLE,DESCRIPTION,CATEGORY,STATUS,CREATED_AT,UPDATED_AT`
    const values: unknown[] = [];
 
    if(search){
      values.push(`%${search}%`);
      queryText += `WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY CREATED_AT DESC`;
    }

    queryText += ` ORDER BY created_at DESC`;
    // const result = await pool.query<ItemRow>(
    //   `SELECT id, title, description, category, status, created_at, updated_at
    //    FROM items
    //    ORDER BY created_at DESC`,
    // );

    const result = await pool.query<ItemRow>(queryText,values);
    const data = result.rows.map(mapItem);

    res.json({
      data,
      total: data.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

app.post('/api/items', async (req, res) => {
  try {

    const { title, description, category, status } = req.body;

    const result = await pool.query<ItemRow>(
      `INSERT INTO items (title, description, category, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, category, status, created_at, updated_at`,
      [title, description, category, status],
    );

    const row = result.rows[0];
    res.status(201).json({
      message: 'Item added successfully',
      item: mapItem(row),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create item' });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query<ItemRow>(
      `SELECT id, title, description, category, status, created_at, updated_at
       FROM items WHERE id = $1`,
      [id],
    );

    const row = result.rows[0];

    if (!row) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.json(mapItem(row));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch item' });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, status } = req.body;

    const result = await pool.query<ItemRow>(
      `UPDATE items
       SET title = $1, description = $2, category = $3, status = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, title, description, category, status, created_at, updated_at`,
      [title, description, category, status, id],
    );

    const row = result.rows[0];

    if (!row) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.json({
      message: 'Item updated successfully',
      item: mapItem(row),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update item' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query<{ id: string }>(
      `DELETE FROM items WHERE id = $1 RETURNING id`,
      [id],
    );

    const row = result.rows[0];

    if (!row) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

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
