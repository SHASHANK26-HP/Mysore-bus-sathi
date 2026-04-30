require("dotenv").config();
const { db, initDb } = require("./db");

function seed() {
  initDb();

  const nowIso = new Date().toISOString();

  const insertRoute = db.prepare(`
    INSERT OR IGNORE INTO bus_routes
      (route_no, from_stop, to_stop, travel_time, frequency, fare, depot)
    VALUES
      (@route_no, @from_stop, @to_stop, @travel_time, @frequency, @fare, @depot)
  `);

  const insertTiming = db.prepare(`
    INSERT OR IGNORE INTO timings
      (route_no, departure_time, badge, type)
    VALUES
      (@route_no, @departure_time, @badge, @type)
  `);

  const insertCrowd = db.prepare(`
    INSERT OR REPLACE INTO crowd_status
      (route_no, taken, total, updated_at)
    VALUES
      (@route_no, @taken, @total, @updated_at)
  `);

  const insertStop = db.prepare(`
    INSERT OR IGNORE INTO stops (name)
    VALUES (?)
  `);

  const routes = [
    {
      route_no: "101",
      from_stop: "CBS (City Bus Stand)",
      to_stop: "Chamundi Betta",
      travel_time: "45 min",
      frequency: "Every 30 min",
      fare: 30,
      depot: "CBS Depot"
    },
    {
      route_no: "102",
      from_stop: "CBS (City Bus Stand)",
      to_stop: "Mysore Palace",
      travel_time: "20 min",
      frequency: "Every 15 min",
      fare: 15,
      depot: "CBS Depot"
    },
    {
      route_no: "103",
      from_stop: "CBS (City Bus Stand)",
      to_stop: "Gokulam",
      travel_time: "25 min",
      frequency: "Every 20 min",
      fare: 20,
      depot: "CBS Depot"
    },
    {
      route_no: "104",
      from_stop: "CBS (City Bus Stand)",
      to_stop: "Hebbal",
      travel_time: "30 min",
      frequency: "Every 25 min",
      fare: 22,
      depot: "CBS Depot"
    },
    {
      route_no: "105",
      from_stop: "CBS (City Bus Stand)",
      to_stop: "Vijayanagar",
      travel_time: "22 min",
      frequency: "Every 20 min",
      fare: 18,
      depot: "CBS Depot"
    },
    {
      route_no: "106",
      from_stop: "CBS (City Bus Stand)",
      to_stop: "Kuvempunagar",
      travel_time: "28 min",
      frequency: "Every 30 min",
      fare: 15,
      depot: "CBS Depot"
    }
  ];

  const timingsByRoute = {
    "101": [
      { t: "06:00 AM", badge: "first" },
      { t: "07:30 AM" },
      { t: "09:00 AM" },
      { t: "11:00 AM" },
      { t: "01:00 PM" },
      { t: "03:00 PM" },
      { t: "05:00 PM" },
      { t: "07:00 PM" },
      { t: "08:00 PM" },
      { t: "09:30 PM", badge: "last" }
    ],
    "102": [
      { t: "05:30 AM", badge: "first" },
      { t: "06:00 AM" },
      { t: "07:00 AM" },
      { t: "08:00 AM" },
      { t: "09:00 AM" },
      { t: "10:00 AM" },
      { t: "11:00 AM" },
      { t: "12:00 PM" },
      { t: "01:00 PM" },
      { t: "02:00 PM" },
      { t: "03:00 PM" },
      { t: "04:00 PM" },
      { t: "05:00 PM" },
      { t: "06:00 PM" },
      { t: "07:00 PM" },
      { t: "08:00 PM" },
      { t: "09:30 PM", badge: "last" }
    ],
    "103": [
      { t: "06:00 AM", badge: "first" },
      { t: "07:30 AM" },
      { t: "09:00 AM" },
      { t: "11:00 AM" },
      { t: "01:00 PM" },
      { t: "03:00 PM" },
      { t: "05:00 PM" },
      { t: "07:00 PM" },
      { t: "09:00 PM", badge: "last" }
    ],
    "104": [
      { t: "06:30 AM", badge: "first" },
      { t: "08:00 AM" },
      { t: "10:00 AM" },
      { t: "12:30 PM" },
      { t: "03:00 PM" },
      { t: "05:30 PM" },
      { t: "08:00 PM", badge: "last" }
    ],
    "105": [
      { t: "05:45 AM", badge: "first" },
      { t: "06:30 AM" },
      { t: "07:00 AM" },
      { t: "08:00 AM" },
      { t: "09:00 AM" },
      { t: "10:00 AM" },
      { t: "12:00 PM" },
      { t: "02:00 PM" },
      { t: "04:00 PM" },
      { t: "06:00 PM" },
      { t: "09:00 PM", badge: "last" }
    ],
    "106": [
      { t: "06:15 AM", badge: "first" },
      { t: "07:30 AM" },
      { t: "09:00 AM" },
      { t: "11:00 AM" },
      { t: "01:00 PM" },
      { t: "03:30 PM" },
      { t: "06:00 PM" },
      { t: "09:00 PM", badge: "last" }
    ]
  };

  const crowd = [
    { route_no: "101", taken: 12, total: 40 },
    { route_no: "102", taken: 29, total: 40 },
    { route_no: "103", taken: 38, total: 40 }
  ];

  const stops = [
    "CBS (City Bus Stand)",
    "Chamundi Betta",
    "Mysore Palace",
    "Gokulam",
    "Hebbal",
    "Vijayanagar",
    "Kuvempunagar",
    "Devaraja Market",
    "Saraswathipuram",
    "Jayalakshmipuram",
    "Bannimantap",
    "JSS Hospital"
  ];

  const tx = db.transaction(() => {
    for (const r of routes) insertRoute.run(r);

    for (const [routeNo, times] of Object.entries(timingsByRoute)) {
      for (const entry of times) {
        insertTiming.run({
          route_no: routeNo,
          departure_time: entry.t,
          badge: entry.badge || null,
          type: entry.badge ? entry.badge : null
        });
      }
    }

    for (const c of crowd) {
      insertCrowd.run({ ...c, updated_at: nowIso });
    }

    for (const s of stops) insertStop.run(s);
  });

  tx();
}

if (require.main === module) {
  try {
    seed();
    console.log("Seed completed.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    try {
      db.close();
    } catch {
      // ignore
    }
  }
}

module.exports = { seed };

