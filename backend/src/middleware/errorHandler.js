const ResponseFormatter = require("../utils/ResponseFormatter");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    const details = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    const response = ResponseFormatter.validationError(
      "Validation Error",
      details
    );
    return res.status(response.statusCode).json(response);
  }

  // Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    const response = ResponseFormatter.conflict("Resource already exists", {
      fields: err.fields,
    });
    return res.status(response.statusCode).json(response);
  }

  // Sequelize foreign key errors
  if (err.name === "SequelizeForeignKeyConstraintError") {
    const response = ResponseFormatter.error(
      "Invalid reference to related resource",
      {
        type: "FOREIGN_KEY_ERROR",
        table: err.table,
      },
      400
    );
    return res.status(response.statusCode).json(response);
  }

  // Sequelize eager loading errors
  if (err.name === "SequelizeEagerLoadingError") {
    const response = ResponseFormatter.error(
      "Database Query Error",
      {
        type: "EAGER_LOADING_ERROR",
        message: err.message,
      },
      500
    );
    return res.status(response.statusCode).json(response);
  }

  // Generic server error
  const response = ResponseFormatter.internalServerError(
    err.message || "Internal Server Error",
    process.env.NODE_ENV === "development" ? err : null
  );
  res.status(response.statusCode).json(response);
};

module.exports = errorHandler;
