import { UserRepository } from "../infra/repositories/user.repository";
import User from "@/shared/infra/sequelize/models/user.model";
import { NotFoundError } from "@/shared/errors/not-found.error";

export class GetUserByIdService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(uuid: string): Promise<User> {
    const user = await this.userRepository.findById(uuid);

    if (!user) {
      throw new NotFoundError("Reseller not found");
    }

    return user;
  }
} 