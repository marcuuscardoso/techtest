import Order, { IOrder, OrderStatus } from "@/shared/infra/sequelize/models/order.model";
import OrderItem from "@/shared/infra/sequelize/models/orderItem.model";
import User from "@/shared/infra/sequelize/models/user.model";

export class OrderRepository {
  async findById(uuid: string): Promise<Order | null> {
    return Order.findByPk(uuid, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: User,
          as: 'user',
          attributes: ['uuid', 'email', 'cnpj', 'legalName', 'brandName']
        }
      ]
    });
  }

  async findAll(status?: OrderStatus): Promise<Order[]> {
    const where = status ? { status } : {};
    
    return Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: User,
          as: 'user',
          attributes: ['uuid', 'email', 'cnpj', 'legalName', 'brandName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async create(orderData: IOrder): Promise<Order> {
    return Order.create(orderData);
  }

  async update(uuid: string, orderData: Partial<IOrder>): Promise<[number, Order[]]> {
    return Order.update(orderData, {
      where: { uuid },
      returning: true
    });
  }

  async updateStatus(uuid: string, status: OrderStatus): Promise<[number, Order[]]> {
    return this.update(uuid, { status });
  }

  async delete(uuid: string): Promise<number> {
    return Order.destroy({
      where: { uuid }
    });
  }
} 