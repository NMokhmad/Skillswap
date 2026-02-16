import sanitizeHtml from 'sanitize-html';

// Configuration stricte : aucune balise HTML autorisée
const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

/**
 * Sanitize récursivement toutes les valeurs string d'un objet.
 */
function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, sanitizeOptions);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware Express qui sanitize req.body et req.query
 * pour supprimer tout HTML/script des entrées utilisateur.
 */
export function sanitize(req, res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
}
