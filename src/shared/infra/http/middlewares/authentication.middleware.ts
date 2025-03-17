import { NextFunction, Request, Response } from "express";
import { ValidationError } from "@/shared/errors/validation.error";
import { JWT } from "@/shared/utils/jwt.util";
import { GetUserByIdService } from "@/modules/users/services/getUserById.service";

export const authenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const getUserById = new GetUserByIdService();

    const { access_token } = req.cookies;

    const payload = JWT.verify({ token: access_token, refresh: false }) as { uuid: string };
    const user = await getUserById.execute(payload.uuid);

    if (!user) throw new ValidationError("Sessão inválida. Por favor, tente reautenticar-se.", 401);

    req.user = user;

    return next();
};