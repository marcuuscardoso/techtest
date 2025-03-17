import { UserRepository } from "../infra/repositories/user.repository";
import User, { IUser } from "@/shared/infra/sequelize/models/user.model";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { ConflictError } from "@/shared/errors/conflict.error";
import { InternalServerError } from "@/shared/errors/internal-server.error";
import { ValidationError } from "@/shared/errors/validation.error";

export class UpdateUserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(uuid: string, userData: Partial<Omit<IUser, 'role' | 'cnpj' | 'legalName' | 'brandName'>>): Promise<User> {
    const existingUser = await this.userRepository.findById(uuid);

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if ('role' in userData || 'cnpj' in userData || 'legalName' in userData || 'brandName' in userData) {
      throw new ValidationError("Cannot update role, cnpj, legalName, or brandName");
    }

    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(userData.email);
      
      if (userWithEmail) {
        throw new ConflictError("Email is already in use");
      }
    }

    const [, updatedUsers] = await this.userRepository.update(uuid, userData);
    
    if (!updatedUsers || updatedUsers.length === 0) {
      throw new InternalServerError("Failed to update user");
    }

    return updatedUsers[0];
  }
} 