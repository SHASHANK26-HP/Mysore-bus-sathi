const express = require("express");
const { db } = require("../db");

const router = express.Router();

router.get("/timings/:route_no", (req, res) => {
  try {
    const { route_no } = req.params;
    if (!route_no) return res.status(400).json({ error: "Missing route_no in path" });

    const route = db
      .prepare("SELECT route_no, from_stop, to_stop FROM bus_routes WHERE route_no = ?")
      .get(route_no);
    if (!route) return res.status(404).json({ error: "Route not found" });

    const timings = db
      .prepare("SELECT departure_time, badge, type FROM timings WHERE route_no = ? ORDER BY id ASC")
      .all(route_no);

    res.json({
      route_no: route.route_no,
      route_name: `${route.from_stop} → ${route.to_stop}`,
      timings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

