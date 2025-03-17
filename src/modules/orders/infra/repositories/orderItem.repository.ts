import OrderItem, { IOrderItem } from "@/shared/infra/sequelize/models/orderItem.model";

export class OrderItemRepository {
  async findById(uuid: string): Promise<OrderItem | null> {
    return OrderItem.findByPk(uuid);
  }

  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    return OrderItem.findAll({
      where: { orderId },
      order: [['createdAt', 'ASC']]
    });
  }

  async create(itemData: IOrderItem): Promise<OrderItem> {
    return OrderItem.create(itemData);
  }

  async createMany(itemsData: IOrderItem[]): Promise<OrderItem[]> {
    return OrderItem.bulkCreate(itemsData);
  }

  async update(uuid: string, itemData: Partial<IOrderItem>): Promise<[number, OrderItem[]]> {
    return OrderItem.update(itemData, {
      where: { uuid },
      returning: true,
    });
  }

  async delete(uuid: string): Promise<number> {
    return OrderItem.destroy({
      where: { uuid },

    });
  }

  async deleteByOrderId(orderId: string): Promise<number> {
    return OrderItem.destroy({
      where: { orderId },
    });
  }
} 