import { Response } from 'express';
import { HttpError } from './http-error';

export const respondError = (res: Response, error: unknown): void => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }

  console.error('[Unhandled Error]', error);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan internal.' });
};
