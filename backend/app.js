const express = require("express");
const cors = require("cors");

// Models
const Creator = require("./models/creator.model");
const Program = require("./models/program.model");
const Session = require("./models/session.model");
require("./models/associations");

// Routes
const authRoutes = require("./routes/auth.routes");
const programRoutes = require("./routes/program.routes");
const sessionRoutes = require("./routes/session.routes");
const auditRoutes = require("./routes/audit.routes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.1.2:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/programs", programRoutes);
app.use("/sessions", sessionRoutes);
app.use("/audit", auditRoutes);

module.exports = app;
