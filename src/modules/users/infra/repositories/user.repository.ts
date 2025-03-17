import User, { IUser } from "@/shared/infra/sequelize/models/user.model";

export class UserRepository {
  async findAll(): Promise<User[]> {
    return User.findAll();
  }

  async findById(uuid: string): Promise<User | null> {
    return User.findOne({
      where: { uuid }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({
      where: { email }
    });
  }

  async create(userData: IUser): Promise<User> {
    return User.create(userData);
  }

  async update(uuid: string, userData: Partial<IUser>): Promise<[number, User[]]> {
    const [affectedCount, affectedRows] = await User.update(userData, {
      where: { uuid },
      returning: true
    });

    return [affectedCount, affectedRows];
  }

  async delete(uuid: string): Promise<number> {
    return User.destroy({
      where: { uuid }
    });
  }
} 