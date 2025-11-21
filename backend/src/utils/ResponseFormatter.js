class ResponseFormatter {
  
  static success(message, data = null, statusCode = 200) {
    return {
      status: "success",
      statusCode,
      message,
      data: data !== null ? data : undefined,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message, error, statusCode = 400, data = null) {
    return {
      status: "error",
      statusCode,
      message,
      data: data !== null ? data : undefined,
      error: error || null,
      timestamp: new Date().toISOString(),
    };
  }

  static validationError(message, errors) {
    return {
      status: "error",
      statusCode: 400,
      message,
      data: null,
      error: {
        type: "VALIDATION_ERROR",
        details: errors,
      },
      timestamp: new Date().toISOString(),
    };
  }

  static notFound(resource) {
    return {
      status: "error",
      statusCode: 404,
      message: `${resource} not found`,
      data: null,
      error: {
        type: "NOT_FOUND",
        resource,
      },
      timestamp: new Date().toISOString(),
    };
  }

  static unauthorized(message = "Unauthorized") {
    return {
      status: "error",
      statusCode: 401,
      message,
      data: null,
      error: {
        type: "UNAUTHORIZED",
      },
      timestamp: new Date().toISOString(),
    };
  }

  static forbidden(message = "Forbidden") {
    return {
      status: "error",
      statusCode: 403,
      message,
      data: null,
      error: {
        type: "FORBIDDEN",
      },
      timestamp: new Date().toISOString(),
    };
  }

  static conflict(message, data = null) {
    return {
      status: "error",
      statusCode: 409,
      message,
      data,
      error: {
        type: "CONFLICT",
      },
      timestamp: new Date().toISOString(),
    };
  }

  static internalServerError(message = "Internal Server Error", error = null) {
    const response = {
      status: "error",
      statusCode: 500,
      message,
      data: null,
      error: {
        type: "INTERNAL_SERVER_ERROR",
      },
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === "development" && error) {
      response.error.details = error;
    }

    return response;
  }
}

module.exports = ResponseFormatter;
