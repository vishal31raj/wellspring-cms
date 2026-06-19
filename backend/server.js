const app = require("./app");
const sequelize = require("./utils/database");
require("dotenv").config({ quiet: true });

const port = process.env.PORT || 8000;

sequelize
  .authenticate()
  .then(() => {
    console.log("DB connected!");

    app.listen(port, () => {
      console.log(`Backend is running on port ${port}!`);
    });
  })
  .catch((err) => {
    console.error("Database connection failure:", err);
    process.exit(1);
  });
