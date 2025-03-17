import { UserRepository } from "@/modules/users/infra/repositories/user.repository";
import { PasswordUtil } from "@/shared/utils/password.util";
import { JWT } from "@/shared/utils/jwt.util";
import { UnauthorizedError } from "@/shared/errors/unauthorized.error";
import User from "@/shared/infra/sequelize/models/user.model";

interface ILoginRequest {
  email: string;
  password: string;
}

interface ILoginResponse {
  reseller: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export class LoginService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute({ email, password }: ILoginRequest): Promise<ILoginResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatches = await PasswordUtil.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const { accessToken, refreshToken } = JWT.generateTokens(user.uuid);

    const { password: _, ...userWithoutPassword } = user.toJSON();

    return {
      reseller: userWithoutPassword as User,
      accessToken,
      refreshToken
    };
  }
} 