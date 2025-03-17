import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { BaseError } from "./base.error";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import { TechTest } from "../infra/http/app";

interface IErrorTypeMapping {
  type: any;
  status: number;
  message?: (() => string);
}

export const errorHandler: ErrorRequestHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
    if (process.env.DEBUG) console.error(error);

    const errorTypes: IErrorTypeMapping[] = [
        { type: JsonWebTokenError, status: 401 },
        { type: TokenExpiredError, status: 401 },
        { type: BaseError, status: error?.status || 500 },
        {
            type: ZodError,
            status: 401,
            message: () => {
                const issues = error.issues;
                return issues.length === 1
                    ? `Property '${issues[0].path[0]}' is invalid. [${issues[0].message}]`
                    : `One or more properties are invalid. [${issues.map((issue: any) => `"${issue.path[0]}"`).join(", ")}]`;
            }
        }
    ];

    const matchedError = errorTypes.find(({ type }) => error instanceof type);

    const status = matchedError?.status || 500;

    const response = {
        message: matchedError && typeof matchedError.message === "function"
            ? matchedError?.message()
            : error.message || "An internal error occurred. Please try again later.", 
        timestamp: new Date().toISOString(),
        ...(process.env.DEBUG && { stack: error.stack })
    };

    TechTest.instance.logger.error("Some error occured", error);

    res.status(status).send(response);
};

export const errorMiddleware = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };