const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Creator = sequelize.define("creator", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  profileImgUrl: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = Creator;
