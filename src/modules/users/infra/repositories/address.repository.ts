import Address, { IAddress } from "@/shared/infra/sequelize/models/address.model";

export class AddressRepository {
  async findByUserId(userId: string): Promise<Address[]> {
    return Address.findAll({
      where: { userId }
    });
  }

  async create(addressData: IAddress): Promise<Address> {
    return Address.create(addressData);
  }

  async createMany(addressesData: IAddress[]): Promise<Address[]> {
    return Address.bulkCreate(addressesData);
  }

  async update(uuid: string, addressData: Partial<IAddress>): Promise<[number, Address[]]> {
    const [affectedCount, affectedRows] = await Address.update(addressData, {
      where: { uuid },
      returning: true
    });

    return [affectedCount, affectedRows];
  }

  async delete(uuid: string): Promise<number> {
    return Address.destroy({
      where: { uuid }
    });
  }

  async deleteByUserId(userId: string): Promise<number> {
    return Address.destroy({
      where: { userId }
    });
  }
} 