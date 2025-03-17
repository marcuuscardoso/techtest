import { UserController } from "../controllers/user.controller";
import { errorMiddleware } from "@/shared/errors/error.handler";
import { defineRouter, EAuthMethod, ERouterMethod } from "@/shared/infra/http/api/defineRouter";
import { EUserRole } from "@/shared/infra/sequelize/models/user.model";

const userController = new UserController();

export default defineRouter([
  {
    method: ERouterMethod.GET,
    url: "/",
    authMethod: EAuthMethod.OPEN,
    handler: errorMiddleware((req, res) => userController.getAllUsers(req, res))
  },
  {
    method: ERouterMethod.GET,
    url: "/:id",
    authMethod: EAuthMethod.OPEN,
    handler: errorMiddleware((req, res) => userController.getUserById(req, res))
  },
  {
    method: ERouterMethod.POST,
    url: "/",
    authMethod: EAuthMethod.PUBLIC,
    // roles: [EUserRole.ADMIN],
    handler: errorMiddleware((req, res) => userController.createUser(req, res))
  },
  {
    method: ERouterMethod.PATCH,
    url: "/:id",
    authMethod: EAuthMethod.PRIVATE,
    roles: [EUserRole.ADMIN],
    handler: errorMiddleware((req, res) => userController.updateUser(req, res))
  },
  {
    method: ERouterMethod.DELETE,
    url: "/:id",
    authMethod: EAuthMethod.PRIVATE,
    roles: [EUserRole.ADMIN],
    handler: errorMiddleware((req, res) => userController.deleteUser(req, res))
  }
]); 