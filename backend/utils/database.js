const Sequelize = require("sequelize");

require("dotenv").config({ quiet: true });

const dbName =
  process.env.NODE_ENV === "test"
    ? process.env.DB_TEST_NAME
    : process.env.DB_NAME;

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: "postgres",
    host: process.env.DB_HOST,
    logging: false,
  },
);

module.exports = sequelize;
