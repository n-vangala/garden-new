import { Request, Response, NextFunction } from 'express';
import 'express';

declare global {
  namespace Express {
    // Fix for the file interface in multer
    interface Multer {
      single(fieldname: string): any;
    }

    // Extend the Request interface to include the file property
    interface Request {
      file?: Multer.File;
    }
  }
}

// Fix Express router handler types
declare module 'express-serve-static-core' {
  interface IRouterMatcher<T> {
    // Add overloads that properly support our return types
    (path: string, ...handlers: Array<(req: Request, res: Response, next: NextFunction) => any>): T;
  }
} 