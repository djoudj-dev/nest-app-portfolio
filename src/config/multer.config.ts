import { diskStorage } from 'multer';
import * as fs from 'fs';
import { Request } from 'express';

const uploadPath = './uploads';

export const getMulterConfig = () => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      cb(null, `${timestamp}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowed = /\.(pdf|doc|docx)$/i;
    if (!allowed.test(file.originalname)) {
      return cb(
        new Error('Seuls les fichiers PDF, DOC, DOCX sont autorisés'),
        false,
      );
    }
    cb(null, true);
  },
});
