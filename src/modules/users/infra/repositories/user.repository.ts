import User, { IUser } from "@/shared/infra/sequelize/models/user.model";
import Address from "@/shared/infra/sequelize/models/address.model";
import Phone from "@/shared/infra/sequelize/models/phone.model";
import UserName from "@/shared/infra/sequelize/models/userName.model";

export class UserRepository {
  async findAll(): Promise<User[]> {
    return User.findAll({
      include: [
        { model: Address },
        { model: Phone },
        { model: UserName }
      ]
    });
  }

  async findById(uuid: string): Promise<User | null> {
    return User.findOne({
      where: { uuid },
      include: [
        { model: Address },
        { model: Phone },
        { model: UserName }
      ]
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({
      where: { email },
      include: [
        { model: Address },
        { model: Phone },
        { model: UserName }
      ]
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