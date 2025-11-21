require("dotenv").config();
const express = require("express");
const models = require("./models");
const apiKeyMiddleware = require("./middleware/apiKeyMiddleware");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const productRoutes = require("./routes/products");
const stockRoutes = require("./routes/stocks");
const purchaseRoutes = require("./routes/purchase");
const webhookRoutes = require("./routes/webhook");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, x-api-key, Authorization"
  );
  res.header("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(express.json());

// Health check endpoint (no auth required)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Webhook routes (no API key required - webhook hub uses signature verification)
app.use("/api/webhook", webhookRoutes);

// Apply API Key middleware to all other API routes
app.use("/api", apiKeyMiddleware);

// Routes
app.use("/api/products", productRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/purchase", purchaseRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await models.sequelize.authenticate();
    console.log("✓ Database connection established");

    // Sync models with database (without altering existing tables)
    await models.sequelize.sync({ alter: false });
    console.log("✓ Database models synced");

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
