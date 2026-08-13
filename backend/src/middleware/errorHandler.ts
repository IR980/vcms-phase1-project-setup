import {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";

import mongoose from "mongoose";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";

import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(
    new ApiError(
      404,
      `Route ${req.originalUrl} not found`
    )
  );
};

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.flatten();
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (
    (err as { code?: number })?.code === 11000
  ) {
    statusCode = 409;
    message = "Duplicate value";
  } else if (
    err instanceof TokenExpiredError
  ) {
    statusCode = 401;
    message = "Token expired";
  } else if (
    err instanceof JsonWebTokenError
  ) {
    statusCode = 401;
    message = "Invalid token";
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(env.NODE_ENV !== "production" &&
      err instanceof Error && {
        stack: err.stack,
      }),
  });
};