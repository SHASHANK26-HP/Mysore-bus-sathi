const express = require("express");
const { db } = require("../db");

const router = express.Router();

router.get("/lostfound", (req, res) => {
  try {
    const items = db
      .prepare(
        `
        SELECT id, item_name, description, route_no, date_found, contact, status, created_at
        FROM lost_found
        ORDER BY datetime(created_at) DESC
      `
      )
      .all();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/lostfound", (req, res) => {
  try {
    const { item_name, description, route_no, date_found, contact } = req.body || {};
    if (!item_name || !description || !date_found || !contact) {
      return res.status(400).json({
        error: "Missing required body fields: item_name, description, date_found, contact (route_no optional)"
      });
    }

    const createdAt = new Date().toISOString();
    const status = "open";

    const stmt = db.prepare(`
      INSERT INTO lost_found (item_name, description, route_no, date_found, contact, status, created_at)
      VALUES (@item_name, @description, @route_no, @date_found, @contact, @status, @created_at)
    `);

    const info = stmt.run({
      item_name,
      description,
      route_no: route_no || null,
      date_found,
      contact,
      status,
      created_at: createdAt
    });

    const created = db
      .prepare(
        `
        SELECT id, item_name, description, route_no, date_found, contact, status, created_at
        FROM lost_found
        WHERE id = ?
      `
      )
      .get(info.lastInsertRowid);

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/lostfound/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!id) return res.status(400).json({ error: "Missing id in path" });
    if (!status) return res.status(400).json({ error: "Missing required body field: status" });
    if (!["open", "claimed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'open' or 'claimed'" });
    }

    const exists = db.prepare("SELECT id FROM lost_found WHERE id = ?").get(id);
    if (!exists) return res.status(404).json({ error: "Item not found" });

    db.prepare("UPDATE lost_found SET status = ? WHERE id = ?").run(status, id);

    const updated = db
      .prepare(
        `
        SELECT id, item_name, description, route_no, date_found, contact, status, created_at
        FROM lost_found
        WHERE id = ?
      `
      )
      .get(id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

