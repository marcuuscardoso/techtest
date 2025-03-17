import { UserRepository } from "../infra/repositories/user.repository";
import User, { EUserRole, IUser } from "@/shared/infra/sequelize/models/user.model";
import { ConflictError } from "@/shared/errors/conflict.error";
import { ValidationError } from "@/shared/errors/validation.error";
import { PasswordUtil } from "@/shared/utils/password.util";
import { BrasilApiService } from "@/shared/services/brasilApi.service";

export class CreateUserService {
  private userRepository: UserRepository;
  private brasilApiService: BrasilApiService;

  constructor() {
    this.userRepository = new UserRepository();
    this.brasilApiService = BrasilApiService.getInstance();
  }

  async execute(userData: Omit<IUser, 'legalName' | 'brandName' | 'role'>): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    if (!userData.password || userData.password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }

    const hashedPassword = await PasswordUtil.hash(userData.password);

    const cnpjData = await this.brasilApiService.getCNPJ(userData.cnpj);

    const userDataWithDefaults: IUser = {
      ...userData,
      password: hashedPassword,
      legalName: cnpjData.razao_social,
      brandName: cnpjData.nome_fantasia,
      role: EUserRole.USER
    };

    return this.userRepository.create(userDataWithDefaults);
  }
} 