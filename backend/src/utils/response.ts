import type { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

export function successResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  data: any = null,
): void {
  const response: ApiResponse = {
    success: false,
    message,
    data,
  };
  res.status(statusCode).json(response);
}
