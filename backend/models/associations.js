const Creator = require("./creator.model");
const Program = require("./program.model");
const Session = require("./session.model");

// Creator -> Program
Creator.hasMany(Program, {
  foreignKey: {
    name: "creatorId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});

Program.belongsTo(Creator, {
  foreignKey: "creatorId",
});

// Program -> Session
Program.hasMany(Session, {
  foreignKey: {
    name: "programId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});

Session.belongsTo(Program, {
  foreignKey: "programId",
});
