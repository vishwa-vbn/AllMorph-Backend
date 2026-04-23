/**
 * Custom middleware to sanitize incoming request data.
 * It recursively trims strings and strips HTML tags from string values.
 * EXCEPT for rich text fields like "content".
 */
const sanitize = (obj, isRichContent = false) => {
  if (typeof obj !== "object" || obj === null) {
    if (typeof obj === "string") {
      if (isRichContent) {
        // Keep HTML as-is for rich text fields (only trim)
        return obj.trim();
      }
      // Basic HTML tag stripping for normal fields
      return obj.replace(/<[^>]*>?/gm, "").trim();
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item, false));
  }

  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Mark "content" as rich text so we don't strip tags
      const isRich =
        key === "content" ||
        key === "body" ||
        key === "description" ||
        key === "script" ||
        key === "ins_code";
      newObj[key] = sanitize(obj[key], isRich);
    }
  }
  return newObj;
};

const sanitizationMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  next();
};

module.exports = sanitizationMiddleware;
