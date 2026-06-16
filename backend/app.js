const express = require("express");
require("dotenv").config({ quiet: true });

const Creator = require("./models/creator.model");
const Program = require("./models/program.model");
const Session = require("./models/session.model");
require("./models/associations");

const authRoutes = require("./routes/auth.routes");

const sequelize = require("./utils/database");

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);

sequelize
  .sync({ alter: true })
  .then((result) => {
    console.log("Connected to DB!");
    app.listen(process.env.PORT || 8000);
  })
  .catch((err) => console.log("Failed to connect to DB!", err));
