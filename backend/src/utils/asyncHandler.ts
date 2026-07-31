import type { Request, Response, NextFunction } from "express";

type AsyncHandler<TReq extends Request, TRes extends Response> = (
  req: TReq,
  res: TRes,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler =
  <TReq extends Request, TRes extends Response>(fn: AsyncHandler<TReq, TRes>) =>
  (req: TReq, res: TRes, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
