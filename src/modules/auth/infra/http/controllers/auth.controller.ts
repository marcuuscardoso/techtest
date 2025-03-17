import { GetOrCreateUserService } from "@/modules/users/services/getOrCreate.service";
import { GetUserByIdService } from "@/modules/users/services/getUserById.service";
import { JWT } from "@/shared/utils/jwt.util";
import { Request, Response } from "express";
  
export class AuthController {
    private readonly getUserById: GetUserByIdService;

    constructor() {
        this.getUserById = new GetUserByIdService();
    }

    async refresh(req: Request, res: Response) {
        const { refresh_token } = req.cookies;
        
        const payload = JWT.verify({ token: refresh_token, refresh: true }) as { id: string };
        const user = await this.getUserById.execute(payload.id);

        if (!user) {
            return res
                .status(401)
                .clearCookie("access_token")
                .clearCookie("refresh_token")
                .send({ message: "Sessão inválida. Por favor, tente reautenticar-se." });
        }

        const { accessToken, refreshToken } = JWT.generateTokens(user.id);

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
