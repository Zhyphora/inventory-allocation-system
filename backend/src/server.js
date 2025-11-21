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

// Middleware
app.use(express.json());

// Health check endpoint (no auth required)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Apply API Key middleware to all API routes
app.use("/api", apiKeyMiddleware);

// Routes
app.use("/api/products", productRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/webhook", webhookRoutes);

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
