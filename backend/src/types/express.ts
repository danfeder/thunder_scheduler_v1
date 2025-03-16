import { Request, Response, NextFunction } from 'express';

export type AsyncRequestHandler<P = {}, ResBody = any, ReqBody = any, ReqQuery = any> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void | Response>;