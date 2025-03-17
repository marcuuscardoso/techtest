import { Router } from "express";
import userRouter from "@modules/users/infra/http/routes/user.routes";
import authRouter from "@modules/auth/infra/http/routes/auth.routes";

const router = Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);

export default router;