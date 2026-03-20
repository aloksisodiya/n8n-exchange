/**
 * Global error handling middleware
 * Catches all errors and sends consistent error responses
 */

export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message || err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: errors.join(", "),
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID",
      message: `Invalid ${err.path}: ${err.value}`,
      timestamp: new Date().toISOString(),
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: "Duplicate Entry",
      message: `${field} already exists`,
      timestamp: new Date().toISOString(),
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid Token",
      message: "Your authentication token is invalid",
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token Expired",
      message: "Your session has expired. Please log in again.",
      timestamp: new Date().toISOString(),
    });
  }

  // Network/API failure errors
  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.code === "ETIMEDOUT") {
    return res.status(503).json({
      success: false,
      error: "Service Unavailable",
      message: "Unable to connect to external service. Please try again later.",
      code: err.code,
      timestamp: new Date().toISOString(),
    });
  }

  // Axios API errors
  if (err.response) {
    // The request was made and the server responded with a status code outside 2xx range
    return res.status(err.response.status || 500).json({
      success: false,
      error: err.response.statusText || "API Error",
      message: err.response.data?.message || err.message,
      details: err.response.data,
      timestamp: new Date().toISOString(),
    });
  }

  if (err.request) {
    // The request was made but no response was received
    return res.status(503).json({
      success: false,
      error: "No Response",
      message: "No response received from the server. Please check the connection.",
      timestamp: new Date().toISOString(),
    });
  }

  // Workflow execution errors
  if (err.isWorkflowError) {
    return res.status(422).json({
      success: false,
      error: "Workflow Execution Error",
      message: err.message,
      workflowId: err.workflowId,
      nodeId: err.nodeId,
      details: err.details || {},
      timestamp: new Date().toISOString(),
    });
  }

  // Invalid workflow error
  if (err.isInvalidWorkflow) {
    return res.status(400).json({
      success: false,
      error: "Invalid Workflow",
      message: err.message,
      workflowId: err.workflowId,
      validationErrors: err.validationErrors || {},
      timestamp: new Date().toISOString(),
    });
  }

  // Custom API errors
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: err.error || "Error",
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 * Catches all unmatched routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async handler wrapper
 * Eliminates need for try-catch in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, statusCode = 500, error = "Error") {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Workflow Execution Error
 * Thrown when a workflow fails to execute
 */
export class WorkflowExecutionError extends Error {
  constructor(message, workflowId, nodeId = null, details = {}) {
    super(message);
    this.workflowId = workflowId;
    this.nodeId = nodeId;
    this.details = details;
    this.isWorkflowError = true;
    this.isOperational = true;
    this.statusCode = 422;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Invalid Workflow Error
 * Thrown when workflow validation fails
 */
export class InvalidWorkflowError extends Error {
  constructor(message, workflowId, validationErrors = {}) {
    super(message);
    this.workflowId = workflowId;
    this.validationErrors = validationErrors;
    this.isInvalidWorkflow = true;
    this.isOperational = true;
    this.statusCode = 400;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * API Connection Error
 * Thrown when external API fails
 */
export class APIConnectionError extends Error {
  constructor(message, service = null, code = null, originalError = null) {
    super(message);
    this.service = service;
    this.code = code;
    this.originalError = originalError;
    this.isOperational = true;
    this.statusCode = 503;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Disconnect/Connection Error
 * Thrown when connection is lost
 */
export class DisconnectionError extends Error {
  constructor(message, component = null) {
    super(message);
    this.component = component;
    this.isOperational = true;
    this.statusCode = 503;
    Error.captureStackTrace(this, this.constructor);
  }
}
