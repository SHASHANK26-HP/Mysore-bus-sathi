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

function parseMinutes(travelTime) {
  const m = String(travelTime || "").match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

router.get("/stops", (req, res) => {
  try {
    const rows = db.prepare("SELECT name FROM stops ORDER BY name ASC").all();
    res.json(rows.map((r) => r.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/routes/all", (req, res) => {
  try {
    const routes = db.prepare("SELECT * FROM bus_routes ORDER BY route_no ASC").all();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/routes/search", (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: "Missing required query params: from, to" });
    }

    const route = db
      .prepare(
        `
        SELECT * FROM bus_routes
        WHERE (from_stop = ? AND to_stop = ?)
           OR (from_stop = ? AND to_stop = ?)
        LIMIT 1
      `
      )
      .get(from, to, to, from);

    if (!route) return res.json([]);

    const crowd = db.prepare("SELECT taken, total FROM crowd_status WHERE route_no = ?").get(route.route_no);
    const crowdText = crowd ? crowdLevel(crowd.taken, crowd.total) : "Unknown";

    const base = {
      route_no: route.route_no,
      from_stop: route.from_stop,
      to_stop: route.to_stop,
      travel_time: route.travel_time,
      frequency: route.frequency,
      fare: route.fare,
      depot: route.depot,
      crowd: crowdText
    };

    const minutes = parseMinutes(route.travel_time);
    const altMinutes = minutes == null ? null : minutes + 10;
    const alternate = {
      ...base,
      route_no: `${route.route_no}-ALT`,
      travel_time: altMinutes == null ? route.travel_time : `${altMinutes} min`,
      fare: Number(route.fare) + 5,
      crowd: "Moderate",
      depot: route.depot
    };

    res.json([base, alternate]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

