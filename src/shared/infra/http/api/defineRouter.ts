import { Router, Request, Response, NextFunction } from "express";
import { EUserRole } from "../../sequelize/models/user.model";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { errorMiddleware } from "@/shared/errors/error.handler";

export enum ERouterMethod {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete",
    PATCH = "patch"
};

/**
 * PUBLIC: The endpoint is public and can be accessed without authentication.
 * OPEN: The endpoint needs authentication, but doesn't require roles.
 * PRIVATE: The endpoint needs authentication and requires a role.
 */
export enum EAuthMethod {
    PUBLIC = "public",
    OPEN = "open",
    PRIVATE = "private"
};

interface IRouteDefinition {
    method: ERouterMethod;
    url: string;
    authMethod: EAuthMethod;
    roles?: EUserRole[];
    handler: (req: Request, res: Response, next: NextFunction) => Promise<any> | void;
};

const setAuth = (authMethod: EAuthMethod, roles?: EUserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        req.auth = {
            method: authMethod,
            roles: roles
        };

        next();
    };
};

export const defineRouter = (routes: IRouteDefinition[]): Router => {
    const router = Router();

    for (const route of routes) {
        router[route.method](
            route.url,
            setAuth(route.authMethod, route.roles),
            ...(route.authMethod === EAuthMethod.PUBLIC ? [] : [errorMiddleware(authenticationMiddleware)]),
            route.handler
        );
    };

    return router;
};