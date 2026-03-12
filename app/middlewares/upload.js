import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileTypeFromFile } from 'file-type';

const uploadDir = 'public/uploads/avatars';

// Créer le dossier d'upload s'il n'existe pas (évite ENOENT en production)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nom unique : userId-timestamp.extension
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${req.user.id}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format non supporté. Utilisez JPG, PNG, GIF ou WebP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo
});

export const uploadAvatar = upload.single('avatar');

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

export async function validateAndRenameAvatar(req, res, next) {
  if (!req.file) return next();

  const filePath = req.file.path;

  try {
    const detected = await fileTypeFromFile(filePath);

    if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
      await fs.promises.unlink(filePath);
      req.file = null;
      return res.status(400).json({
        status: 400,
        code: 'INVALID_FILE_TYPE',
        message: 'Format non supporté. Utilisez JPG, PNG, GIF ou WebP.',
      });
    }

    const correctExt = MIME_TO_EXT[detected.mime];
    const currentExt = path.extname(req.file.filename).toLowerCase();

    if (currentExt !== correctExt) {
      const newFilename = req.file.filename.slice(0, req.file.filename.lastIndexOf('.')) + correctExt;
      const newPath = path.join(uploadDir, newFilename);
      await fs.promises.rename(filePath, newPath);
      req.file.filename = newFilename;
      req.file.path = newPath;
    }

    next();
  } catch {
    try { await fs.promises.unlink(filePath); } catch { /* best-effort cleanup */ }
    return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
  }
}
