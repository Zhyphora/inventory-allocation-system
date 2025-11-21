const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "inventory_db",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "postgres",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
  }
);

const models = {};

// Load all models
const Warehouse = require("./Warehouse")(sequelize);
const Product = require("./Product")(sequelize);
const Stock = require("./Stock")(sequelize);
const PurchaseRequest = require("./PurchaseRequest")(sequelize);
const PurchaseRequestItem = require("./PurchaseRequestItem")(sequelize);

models.Warehouse = Warehouse;
models.Product = Product;
models.Stock = Stock;
models.PurchaseRequest = PurchaseRequest;
models.PurchaseRequestItem = PurchaseRequestItem;

// Define associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
