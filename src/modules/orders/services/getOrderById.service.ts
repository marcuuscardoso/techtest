import { OrderRepository } from "../infra/repositories/order.repository";
import Order from "@/shared/infra/sequelize/models/order.model";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { ValidationError } from "@/shared/errors/validation.error";

export class GetOrderByIdService {
  private orderRepository: OrderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async execute(uuid: string): Promise<Order> {
    if (!uuid) {
      throw new ValidationError("ID do pedido é obrigatório");
    }

    const order = await this.orderRepository.findById(uuid);

    if (!order) {
      throw new NotFoundError("Pedido não encontrado");
    }

    return order;
  }
} 