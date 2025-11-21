const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: err.errors.map((e) => e.message),
    });
  }

  // Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      error: "Constraint Error",
      message: "Resource already exists",
    });
  }

  // Sequelize foreign key errors
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      error: "Foreign Key Error",
      message: "Invalid reference to related resource",
    });
  }

  // Generic server error
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message,
  });
};

module.exports = errorHandler;
