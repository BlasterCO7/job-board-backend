import express from "express";
import pool from "../db.js";  // PostgreSQL connection

const router = express.Router();

// ✅ Get all jobs with optional search, location & pagination
router.get("/", async (req, res) => {
    try {
        const { search, location, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM jobs WHERE 1=1";
        let params = [];

        if (search) {
            params.push(`%${search}%`);
            query += ` AND title ILIKE $${params.length}`;
        }
        if (location) {
            params.push(`%${location}%`);
            query += ` AND location ILIKE $${params.length}`;
        }

        // Add pagination only if required
        params.push(limit);
        query += ` ORDER BY created_at DESC LIMIT $${params.length}`;

        params.push(offset);
        query += ` OFFSET $${params.length}`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
