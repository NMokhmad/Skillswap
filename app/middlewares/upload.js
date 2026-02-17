import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
