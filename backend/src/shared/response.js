/** Success envelope helper. */
export function ok(res, data, message = "Success", status = 200) {
  return res.status(status).json({ success: true, data, message });
}
