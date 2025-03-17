import { AuthController } from "../controllers/auth.controller";
import { errorMiddleware } from "@shared/errors/error.handler";
import { defineRouter, EAuthMethod, ERouterMethod } from "@/shared/infra/http/api/defineRouter";

const authController = new AuthController();

export default defineRouter([
    {
        method: ERouterMethod.GET,
        url: "/session",
        authMethod: EAuthMethod.OPEN,
        handler: errorMiddleware((req, res) => authController.session(req, res))
    },
    {
        method: ERouterMethod.GET,
        url: "/logout",
        authMethod: EAuthMethod.OPEN,
        handler: errorMiddleware((req, res) => authController.signOut(req, res))
    },
    {
        method: ERouterMethod.POST,
        url: "/refresh",
        authMethod: EAuthMethod.PUBLIC,
        handler: errorMiddleware((req, res) => authController.refresh(req, res))
    }
]);