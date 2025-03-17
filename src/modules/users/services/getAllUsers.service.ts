import { UserRepository } from "../infra/repositories/user.repository";
import User from "@/shared/infra/sequelize/models/user.model";

export class GetAllUsersService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
} 