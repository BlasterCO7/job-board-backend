import express from "express";
import pool from "../db.js";  // PostgreSQL connection

const router = express.Router();

// ✅ Get all jobs with optional search & pagination
router.get("/", async (req, res) => {
    try {
        const { search, location, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM jobs WHERE 1=1";
        let params = [];

        if (search) {
            query += " AND title ILIKE $1";
            params.push(`%${search}%`);
        }
        if (location) {
            query += " AND location ILIKE $2";
            params.push(`%${location}%`);
        }

        query += " ORDER BY created_at DESC LIMIT $3 OFFSET $4";
        params.push(limit, offset);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ✅ Get a single job by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
