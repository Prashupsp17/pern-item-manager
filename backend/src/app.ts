import cors from 'cors';
import express from 'express';
import { pool } from './db/pool.js';
import { globalRateLimit, writeLimiter } from './middleware/rateLimit.js';

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

app.use('/api', globalRateLimit);

/*
 * GET /api/items — learning reference (commented; only one handler can be active).
 *
 * Step 1 — fetch all items (no query params):
 *
 * app.get('/api/items', async (_req, res) => {
 *   try {
 *     const result = await pool.query<ItemRow>(
 *       `SELECT id, title, description, category, status, created_at, updated_at
 *        FROM items
 *        ORDER BY created_at DESC`,
 *     );
 *     const data = result.rows.map(mapItem);
 *     res.json({
 *       data,
 *       total: data.length,
 *       page: 1,
 *       limit: 10,
 *       totalPages: 1,
 *     });
 *   } catch (error) {
 *     console.error(error);
 *     res.status(500).json({ message: 'Failed to fetch items' });
 *   }
 * });
 *
 * Step 2 — add search (?search=):
 *   - const search = String(req.query.search ?? '').trim();
 *   - if (search) { values.push(`%${search}%`); add WHERE title ILIKE $1 OR description ILIKE $1 }
 *   - pool.query(queryText, values)
 *
 * Step 3 — add pagination (?page=&limit=): COUNT with same WHERE, then LIMIT/OFFSET (active handler below).
 */

const ITEM_STATUSES = new Set(['active', 'inactive', 'draft']);

app.get('/api/items', async (req, res) => {
  try {
    const search = String(req.query.search ?? '').trim();
    const category = String(req.query.category ?? '').trim();
    const status = String(req.query.status ?? '').trim();
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (search) {
      values.push(`%${search}%`);
      const index = values.length;
      conditions.push(
        `(title ILIKE $${index} OR description ILIKE $${index} OR category ILIKE $${index})`,
      );
    }

    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    if (status && ITEM_STATUSES.has(status)) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM items ${whereClause}`,
      values,
    );

    const total = Number(countResult.rows[0]?.count ?? 0);
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

    let queryText = `
      SELECT id, title, description, category, status, created_at, updated_at
      FROM items
      ${whereClause}
      ORDER BY created_at DESC
    `;

    values.push(limit, offset);
    const limitIndex = values.length - 1;
    const offsetIndex = values.length;
    queryText += ` LIMIT $${limitIndex} OFFSET $${offsetIndex}`;

    const result = await pool.query<ItemRow>(queryText, values);
    const data = result.rows.map(mapItem);

    res.json({
      data,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

app.post('/api/items', writeLimiter, async (req, res) => {
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

app.put('/api/items/:id', writeLimiter, async (req, res) => {
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

app.delete('/api/items/:id', writeLimiter, async (req, res) => {
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
