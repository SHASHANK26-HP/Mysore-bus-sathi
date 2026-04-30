const express = require("express");
const { db } = require("../db");

const router = express.Router();

router.get("/fares", (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: "Missing required query params: from, to" });
    }

    const route = db
      .prepare(
        `
        SELECT route_no, from_stop, to_stop, fare
        FROM bus_routes
        WHERE (from_stop = ? AND to_stop = ?)
           OR (from_stop = ? AND to_stop = ?)
        LIMIT 1
      `
      )
      .get(from, to, to, from);

    if (!route) return res.status(404).json({ error: "Route not found" });

    res.json({
      from_stop: route.from_stop,
      to_stop: route.to_stop,
      fare: route.fare,
      route_no: route.route_no
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

