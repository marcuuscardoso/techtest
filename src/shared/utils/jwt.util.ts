import { ValidationError } from "@/shared/errors/validation.error";
import jwt, { JwtPayload } from "jsonwebtoken";

export abstract class JWT {
    private static readonly ACCESS_TOKEN_EXPIRATION = "5m";
    private static readonly REFRESH_TOKEN_EXPIRATION = "7d";

    static sign({ uuid, refresh = false }: { uuid: string, refresh: boolean }) {
        return jwt.sign({ uuid }, refresh ? process.env.SECRET_REFRESH as string : process.env.SECRET as string, {
            expiresIn: refresh ? this.REFRESH_TOKEN_EXPIRATION : this.ACCESS_TOKEN_EXPIRATION
        });
    }

    static verify({ token, refresh = false }: { token: string, refresh: boolean }): JwtPayload | string {
        if (!token) throw new ValidationError("Sessão inválida. Por favor, tente reautenticar-se.", 401);
  
        return jwt.verify(token, refresh ? process.env.SECRET_REFRESH as string : process.env.SECRET as string);
    }

    static generateTokens(id: string) {
        return {
            accessToken: this.sign({ uuid: id, refresh: false }),
            refreshToken: this.sign({ uuid: id, refresh: true })
        };
    }
}