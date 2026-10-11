import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

/** Custom 429 response when a limit is exceeded (used inside rateLimit(), not mounted alone). */
function rateLimitHandler(res: Response, errorMessage: string) {
  res.status(429).json({
    error: errorMessage,
    status: 429,
  });
}

/** All /api/* routes — 100 requests per 15 minutes per IP */
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    rateLimitHandler(res, 'Too many requests, please try again later.');
  },
});

/** POST / PUT / DELETE — stricter: 30 writes per 15 minutes per IP */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    rateLimitHandler(res, 'Too many write requests, please slow down.');
  },
});
