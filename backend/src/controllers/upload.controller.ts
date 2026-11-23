import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

export const uploadImageHandler = (req: AuthRequest, res: Response): void => {
  const image = req.processedImage;

  if (!image) {
    res.status(400).json({ success: false, message: 'Gambar belum diproses.' });
    return;
  }

  res.status(201).json({
    success: true,
    image,
    message: 'Gambar berhasil diunggah dan diberi watermark forensik.'
  });
};
