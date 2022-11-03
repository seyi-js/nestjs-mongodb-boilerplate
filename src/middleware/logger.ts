import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export async function appRequestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const logger = new Logger('AppRequestLogger');

  const { method, originalUrl } = req;

  const ip = req.ips.length ? req.ips[0] : req.ip;

  const userAgent = req.get('user-agent') || '';

  res.on('finish', () => {
    const { statusCode } = res;

    const contentLength = res.get('content-length');

    logger.log(
      `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
    );
  });

  next();
}
