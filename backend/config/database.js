require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "dev",
    password: process.env.DB_PASSWORD || "Testing1",
    database: process.env.DB_NAME || "inventory_db",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      useUTC: false,
      statement_timeout: 1000,
    },
    timezone: "+00:00",
    define: {
      timestamps: true,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      useUTC: false,
    },
    timezone: "+00:00",
    define: {
      timestamps: true,
    },
  },
};
