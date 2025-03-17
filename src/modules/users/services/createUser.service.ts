import { UserRepository } from "../infra/repositories/user.repository";
import User, { EUserRole, IUser } from "@/shared/infra/sequelize/models/user.model";
import { ConflictError } from "@/shared/errors/conflict.error";
import { ValidationError } from "@/shared/errors/validation.error";
import { PasswordUtil } from "@/shared/utils/password.util";

export class CreateUserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
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

    const userDataWithDefaults: IUser = {
      ...userData,
      password: hashedPassword,
      legalName: "teste",
      brandName: "teste",
      role: EUserRole.USER
    };

    return this.userRepository.create(userDataWithDefaults);
  }
} 