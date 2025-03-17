import { UserRepository } from "../infra/repositories/user.repository";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { InternalServerError } from "@/shared/errors/internal-server.error";

export class DeleteUserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(uuid: string): Promise<void> {
    const existingUser = await this.userRepository.findById(uuid);

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    const deletedCount = await this.userRepository.delete(uuid);
    
    if (deletedCount === 0) {
      throw new InternalServerError("Failed to delete user");
    }
  }
} 