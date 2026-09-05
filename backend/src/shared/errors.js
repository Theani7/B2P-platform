/** Standard error envelope: { success:false, message, errors } */
export class AppError extends Error {
  constructor(message, statusCode = 400, details = []) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.details || [],
    });
  }

  // Prisma unique/constraint errors -> 409
  if (err && err.name === "PrismaClientKnownRequestError") {
    const status = err.code === "P2002" ? 409 : 400;
    return res.status(status).json({
      success: false,
      message: "Database error",
      errors: [{ detail: err.message }],
    });
  }

  // Multer upload errors -> 413 for oversize, 400 otherwise.
  if (err && err.name === "MulterError") {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({
      success: false,
      message: err.code === "LIMIT_FILE_SIZE" ? "File too large (max 5MB)" : "File upload failed",
      errors: [{ detail: err.message }],
    });
  }

  console.error("[unhandled]", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [{ detail: process.env.NODE_ENV === "production" ? "An unexpected error occurred" : String((err && err.message) || err) }],
  });
}

export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errors: [],
  });
}

export const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (e) {
    next(e);
  }
};
