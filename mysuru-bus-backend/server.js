require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { db, initDb } = require("./db");
const { seed } = require("./seed");

const routesRouter = require("./routes/routes");
const timingsRouter = require("./routes/timings");
const crowdRouter = require("./routes/crowd");
const nextBusRouter = require("./routes/nextbus");
const faresRouter = require("./routes/fares");
const lostFoundRouter = require("./routes/lostfound");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "MysuruBus Saathi API is running", version: "1.0.0" });
});

app.use("/api", routesRouter);
app.use("/api", timingsRouter);
app.use("/api", crowdRouter);
app.use("/api", nextBusRouter);
app.use("/api", faresRouter);
app.use("/api", lostFoundRouter);

function seedIfEmpty() {
  initDb();
  const row = db.prepare("SELECT COUNT(*) AS count FROM stops").get();
  if (!row || row.count === 0) {
    seed();
  }
}

const PORT = Number(process.env.PORT) || 3000;

try {
  seedIfEmpty();
} catch (err) {
  console.error("Startup init/seed failed:", err.message);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`MysuruBus Saathi backend running at http://localhost:${PORT}`);
});

