const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Session = sequelize.define("session", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  duration: {
    type: Sequelize.INTEGER, // in seconds
    allowNull: false,
  },
  position: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  instructorName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    allowNull: true,
  },
  mediaFileUrl: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  type: {
    type: Sequelize.ENUM("audio", "video"),
    allowNull: false,
  },
});

module.exports = Session;
