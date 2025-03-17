import { GetUserByIdService } from "../../../../../modules/users/services/getUserById.service";
import { JWT } from "@/shared/utils/jwt.util";
import { Request, Response } from "express";
import { LoginService } from "@/modules/auth/services/login.service";
import { z } from "zod";
  
export class AuthController {
    private readonly getUserById: GetUserByIdService;
    private readonly loginService: LoginService;

    constructor() {
        this.getUserById = new GetUserByIdService();
        this.loginService = new LoginService();
    }

    async login(req: Request, res: Response) {
        const bodySchema = z.object({
            email: z.string().email(),
            password: z.string().min(1)
        }).strict();

        const { email, password } = bodySchema.parse(req.body);

        const { user, accessToken, refreshToken } = await this.loginService.execute({ email, password });

        return res
            .status(200)
            .cookie("access_token", accessToken, 
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict"
                }
            )
            .cookie("refresh_token", refreshToken, 
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict"
                }
            )
            .json({ user });
    }

    async refresh(req: Request, res: Response) {
        const { refresh_token } = req.cookies;
        
        const payload = JWT.verify({ token: refresh_token, refresh: true }) as { uuid: string };
        const user = await this.getUserById.execute(payload.uuid);

        if (!user) {
            return res
                .status(401)
                .clearCookie("access_token")
                .clearCookie("refresh_token")
                .send({ message: "Sessão inválida. Por favor, tente reautenticar-se." });
        }

        const { accessToken, refreshToken } = JWT.generateTokens(user.uuid);

        return res
            .status(200)
            .cookie("access_token", accessToken, 
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict"
                }
            )
            .cookie("refresh_token", refreshToken, 
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict"
                }
            )
            .send({ message: "Tokens renovados com sucesso" });
    }
    
    async signOut(req: Request, res: Response) {
        return res
            .status(204)
            .clearCookie("access_token")
            .clearCookie("refresh_token")
            .send();
    }

    async session(req: Request, res: Response) {
        const { id, name, email, cnpj, companyName, tradingName, role } = req.user;

        return res
            .status(200)
            .send({
                user: {
                    id,
                    name,
                    email,
                    cnpj,
                    companyName,
                    tradingName,
                    role
                }
            });
    }
}
