const Sequelize = require("sequelize");
const sequelize = require("../utils/database");
const { deleteS3Object } = require("../utils/s3");

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
    allowNull: true,
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
  s3Key: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  mediaFileUrl: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  type: {
    type: Sequelize.ENUM("audio", "video"),
    allowNull: true,
  },
});

Session.addHook("beforeDestroy", async (session) => {
  if (session.s3Key) {
    await deleteS3Object(session.s3Key);
  }
});

module.exports = Session;
