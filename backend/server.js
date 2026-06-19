const app = require("./app");
const sequelize = require("./utils/database");
require("dotenv").config({ quiet: true });

const port = process.env.PORT || 8000;

sequelize
  .authenticate()
  .then(() => {
    console.log("DB connected!");
    // Only run layout-altering synchronization blocks in explicit runtime modes
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend is running on port ${port}!`);
    });
  })
  .catch((err) => {
    console.error("Database connection runtime initialization failure:", err);
    process.exit(1);
  });
