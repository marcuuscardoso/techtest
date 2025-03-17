import { OrderController } from "../controllers/order.controller";
import { errorMiddleware } from "@/shared/errors/error.handler";
import { defineRouter, EAuthMethod, ERouterMethod } from "@/shared/infra/http/api/defineRouter";

const orderController = new OrderController();

export default defineRouter([
    {
        method: ERouterMethod.GET,
        url: "/:id",
        authMethod: EAuthMethod.OPEN,
        handler: errorMiddleware((req, res) => orderController.getOrderById(req, res))
    },
    {
        method: ERouterMethod.POST,
        url: "/",
        authMethod: EAuthMethod.OPEN,
        handler: errorMiddleware((req, res) => orderController.createOrder(req, res))
    },
]);