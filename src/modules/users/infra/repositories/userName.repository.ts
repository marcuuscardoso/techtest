import UserName, { IUserName } from "@/shared/infra/sequelize/models/userName.model";

export class UserNameRepository {
  async findByUserId(userId: string): Promise<UserName[]> {
    return UserName.findAll({
      where: { userId }
    });
  }

  async findPrimaryByUserId(userId: string): Promise<UserName | null> {
    return UserName.findOne({
      where: { userId, isPrimary: true }
    });
  }

  async create(userNameData: IUserName): Promise<UserName> {
    return UserName.create(userNameData);
  }

  async createMany(userNamesData: IUserName[]): Promise<UserName[]> {
    return UserName.bulkCreate(userNamesData);
  }

  async update(uuid: string, userNameData: Partial<IUserName>): Promise<[number, UserName[]]> {
    const [affectedCount, affectedRows] = await UserName.update(userNameData, {
      where: { uuid },
      returning: true
    });

    return [affectedCount, affectedRows];
  }

  async delete(uuid: string): Promise<number> {
    return UserName.destroy({
      where: { uuid }
    });
  }

  async deleteByUserId(userId: string): Promise<number> {
    return UserName.destroy({
      where: { userId }
    });
  }

  async setPrimary(uuid: string, userId: string): Promise<void> {
    await UserName.update(
      { isPrimary: false },
      { where: { userId } }
    );

    await UserName.update(
      { isPrimary: true },
      { where: { uuid } }
    );
  }
} 