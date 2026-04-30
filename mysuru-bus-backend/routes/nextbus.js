const express = require("express");
const { db } = require("../db");

const router = express.Router();

function parseTimeToDateToday(timeStr, baseDate = new Date()) {
  const s = String(timeStr || "").trim();
  const match = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const ampm = match[3].toUpperCase();

  if (hour === 12) hour = 0;
  if (ampm === "PM") hour += 12;

  const d = new Date(baseDate);
  d.setHours(hour, minute, 0, 0);
  return d;
}

router.get("/nextbus", (req, res) => {
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

    const timings = db
      .prepare("SELECT departure_time FROM timings WHERE route_no = ? ORDER BY id ASC")
      .all(route.route_no)
      .map((r) => r.departure_time);

    if (!timings.length) return res.status(404).json({ error: "No timings found for this route" });

    const now = new Date();
    const todayDepartures = timings
      .map((t) => ({ t, when: parseTimeToDateToday(t, now) }))
      .filter((x) => x.when instanceof Date && !Number.isNaN(x.when.getTime()))
      .sort((a, b) => a.when - b.when);

    const lastBusTime = todayDepartures[todayDepartures.length - 1]?.t || timings[timings.length - 1];

    let next = todayDepartures.find((d) => d.when > now) || null;
    let afterNext = null;
    let note = null;
    let nextWhenBase = now;

    if (next) {
      const idx = todayDepartures.findIndex((d) => d.t === next.t);
      afterNext = todayDepartures[idx + 1]?.t || null;
    } else {
      // No more buses today — use next day's first bus
      const first = todayDepartures[0];
      next = first;
      afterNext = todayDepartures[1]?.t || null;
      note = "No more buses today. Showing next day's first bus.";
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      nextWhenBase = tomorrow;
    }

    const nextWhen = parseTimeToDateToday(next.t, nextWhenBase);
    const minutesAway = Math.max(0, Math.ceil((nextWhen.getTime() - now.getTime()) / 60000));

    res.json({
      route_no: route.route_no,
      from_stop: route.from_stop,
      to_stop: route.to_stop,
      next_departure: next.t,
      minutes_away: minutesAway,
      after_next_departure: afterNext,
      fare: route.fare,
      last_bus_time: lastBusTime,
      ...(note ? { note } : {})
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

