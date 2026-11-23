declare global {
  namespace Express {
    interface Request {
      processedImage?: {
        path: string;
        url: string;
        name: string;
        watermarkText: string;
      };
    }
  }
}

export {};
