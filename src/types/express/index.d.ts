import { EAuthMethod } from "@/shared/infra/http/api/defineRouter";
import { EUserRole } from "@/shared/infra/sequelize/models/user.model";

declare global {
    namespace Express {
        interface Request{
            user: User,
            auth: {
                method: EAuthMethod,
                roles: EUserRole[] | undefined
            }
        }
    }
}