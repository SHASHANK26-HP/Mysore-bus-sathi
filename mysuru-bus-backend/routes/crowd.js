const express = require("express");
const { db } = require("../db");

const router = express.Router();

function crowdLevel(taken, total) {
  const t = Number(taken);
  const tot = Number(total);
  if (!Number.isFinite(t) || !Number.isFinite(tot) || tot <= 0) return "Unknown";
  const ratio = t / tot;
  if (ratio < 0.3) return "Low";
  if (ratio <= 0.75) return "Moderate";
  return "High";
}

router.get("/crowd", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT id, route_no, taken, total, updated_at FROM crowd_status ORDER BY route_no ASC")
      .all();

    res.json(
      rows.map((r) => ({
        ...r,
        crowd_level: crowdLevel(r.taken, r.total)
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/crowd/report", (req, res) => {
  try {
    const { route_no, taken, total } = req.body || {};
    if (!route_no || taken == null || total == null) {
      return res.status(400).json({ error: "Missing required body fields: route_no, taken, total" });
    }

    const t = Number(taken);
    const tot = Number(total);
    if (!Number.isInteger(t) || !Number.isInteger(tot) || t < 0 || tot <= 0 || t > tot) {
      return res.status(400).json({ error: "Invalid taken/total. Expect integers where 0 <= taken <= total and total > 0" });
    }

    const updatedAt = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO crowd_status (route_no, taken, total, updated_at)
      VALUES (@route_no, @taken, @total, @updated_at)
      ON CONFLICT(route_no) DO UPDATE SET
        taken = excluded.taken,
        total = excluded.total,
        updated_at = excluded.updated_at
    `);

    stmt.run({ route_no, taken: t, total: tot, updated_at: updatedAt });

    const row = db
      .prepare("SELECT id, route_no, taken, total, updated_at FROM crowd_status WHERE route_no = ?")
      .get(route_no);

    res.json({ ...row, crowd_level: crowdLevel(row.taken, row.total) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

