import { OrderRepository } from "../infra/repositories/order.repository";
import { OrderItemRepository } from "../infra/repositories/orderItem.repository";
import { UserRepository } from "@/modules/users/infra/repositories/user.repository";
import Order, { IOrder, OrderStatus } from "@/shared/infra/sequelize/models/order.model";
import { IOrderItem } from "@/shared/infra/sequelize/models/orderItem.model";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { ValidationError } from "@/shared/errors/validation.error";

interface OrderItemRequest {
  productId: string;
  productName: string;
  quantity: number;
}

interface CreateOrderRequest {
  cnpj: string;
  items: OrderItemRequest[];
  observations?: string;
}

export class CreateOrderService {
  private orderRepository: OrderRepository;
  private orderItemRepository: OrderItemRepository;
  private userRepository: UserRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.orderItemRepository = new OrderItemRepository();
    this.userRepository = new UserRepository();
  }

  async execute(orderData: CreateOrderRequest): Promise<Order> {
    if (!orderData.cnpj) {
      throw new ValidationError("Reseller CNPJ is required");
    }

    const reseller = await this.userRepository.findByCnpj(orderData.cnpj);
    if (!reseller) {
      throw new NotFoundError("Reseller not found");
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new ValidationError("At least one item is required in the order");
    }

    for (const item of orderData.items) {
      if (!item.productId) {
        throw new ValidationError("Product ID is required");
      }
      if (!item.productName) {
        throw new ValidationError("Product name is required");
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new ValidationError("Quantity must be greater than zero");
      }
    }

    const orderDataToCreate: IOrder = {
      resellerId: reseller.uuid,
      status: OrderStatus.PENDING,
      observations: orderData.observations
    };

    const order = await this.orderRepository.create(orderDataToCreate);

    const orderItemsData: IOrderItem[] = orderData.items.map(item => ({
      orderId: order.uuid,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
    }));

    await this.orderItemRepository.createMany(orderItemsData);

    return this.orderRepository.findById(order.uuid) as Promise<Order>;
  }
} 