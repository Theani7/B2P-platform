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

  console.error("[unhandled]", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [{ detail: String((err && err.message) || err) }],
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
