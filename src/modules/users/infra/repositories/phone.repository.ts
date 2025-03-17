import Phone, { IPhone } from "@/shared/infra/sequelize/models/phone.model";

export class PhoneRepository {
  async findByUserId(userId: string): Promise<Phone[]> {
    return Phone.findAll({
      where: { userId }
    });
  }

  async create(phoneData: IPhone): Promise<Phone> {
    return Phone.create(phoneData);
  }

  async createMany(phonesData: IPhone[]): Promise<Phone[]> {
    return Phone.bulkCreate(phonesData);
  }

  async update(uuid: string, phoneData: Partial<IPhone>): Promise<[number, Phone[]]> {
    const [affectedCount, affectedRows] = await Phone.update(phoneData, {
      where: { uuid },
      returning: true
    });

    return [affectedCount, affectedRows];
  }

  async delete(uuid: string): Promise<number> {
    return Phone.destroy({
      where: { uuid }
    });
  }

  async deleteByUserId(userId: string): Promise<number> {
    return Phone.destroy({
      where: { userId }
    });
  }
} 