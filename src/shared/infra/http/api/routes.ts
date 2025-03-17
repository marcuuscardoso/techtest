import { Router } from "express";
import userRouter from "@modules/users/infra/http/routes/user.routes";
import authRouter from "@modules/auth/infra/http/routes/auth.routes";
import orderRoutes from "@/modules/orders/infra/http/routes/order.routes";

const router = Router();

router.use("/resellers", userRouter);
router.use("/auth", authRouter);
router.use("/orders", orderRoutes);

export default router;