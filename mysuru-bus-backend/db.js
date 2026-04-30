const path = require("path");
const Database = require("better-sqlite3");
require("dotenv").config();

const dbFile = process.env.DB_FILE || "./mysuru_bus.db";
const dbPath = path.isAbsolute(dbFile) ? dbFile : path.join(__dirname, dbFile);

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bus_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_no TEXT NOT NULL UNIQUE,
      from_stop TEXT NOT NULL,
      to_stop TEXT NOT NULL,
      travel_time TEXT NOT NULL,
      frequency TEXT NOT NULL,
      fare INTEGER NOT NULL,
      depot TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS timings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_no TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      badge TEXT,
      type TEXT,
      UNIQUE(route_no, departure_time)
    );

    CREATE TABLE IF NOT EXISTS crowd_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_no TEXT NOT NULL UNIQUE,
      taken INTEGER NOT NULL,
      total INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS lost_found (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      description TEXT NOT NULL,
      route_no TEXT,
      date_found TEXT NOT NULL,
      contact TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL
    );
  `);
}

module.exports = { db, initDb, dbPath };

