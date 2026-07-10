import { AppError } from "./errors.js";

/** Zod validation middleware.
 *  source 'body' (default) validates req.body; 'query' / 'params' validate + coerce accordingly. */
export function validate(schema, source = "body") {
  return (req, res, next) => {
    const data =
      source === "query" ? req.query : source === "params" ? req.params : req.body;
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return next(new AppError("Validation failed", 422, errors));
    }
    if (source === "query") req.query = result.data;
    else if (source === "params") req.params = result.data;
    else req.body = result.data;
    next();
  };
}
