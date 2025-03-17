import { OrderRepository } from "../infra/repositories/order.repository";
import { OrderItemRepository } from "../infra/repositories/orderItem.repository";
import { UserRepository } from "@/modules/users/infra/repositories/user.repository";
import Order, { IOrder, OrderStatus } from "@/shared/infra/sequelize/models/order.model";
import { IOrderItem } from "@/shared/infra/sequelize/models/orderItem.model";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { ValidationError } from "@/shared/errors/validation.error";
import { ExternalOrderApiService } from "@/shared/services/externalOrderApi.service";
import { createNamedLogger } from "@/shared/infra/logger";
import { EUserRole } from "@/shared/infra/sequelize/models/user.model";

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
  private externalOrderApiService: ExternalOrderApiService;
  private logger = createNamedLogger('create-order-service', { fileName: 'orders' });

  constructor() {
    this.orderRepository = new OrderRepository();
    this.orderItemRepository = new OrderItemRepository();
    this.userRepository = new UserRepository();
    this.externalOrderApiService = ExternalOrderApiService.getInstance();
  }

  async execute(orderData: CreateOrderRequest): Promise<Order> {
    if (!orderData.cnpj) {
      throw new ValidationError("Reseller CNPJ is required");
    }

    const reseller = await this.userRepository.findByCnpj(orderData.cnpj);
    if (!reseller) {
      throw new NotFoundError("Reseller not found");
    }

    if (reseller.role !== EUserRole.RESELLER) {
      throw new ValidationError("CNPJ must belong to a reseller");
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

    const totalQuantity = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalQuantity >= 1000) {
      const externalOrderResponse = await this.externalOrderApiService.createOrder(
        order.uuid,
        {
          resellerCnpj: reseller.cnpj,
          items: orderData.items,
          observations: orderData.observations
        }
      );

      await this.orderRepository.update(order.uuid, {
        externalOrderId: externalOrderResponse.orderId,
        status: OrderStatus.PROCESSING
      });

      this.logger.info(`Order ${order.uuid} successfully submitted to external API with ID ${externalOrderResponse.orderId}`);
    } else {
      this.logger.info(`Order ${order.uuid} not submitted to external API due to insufficient quantity (${totalQuantity} < 1000)`);
    }

    return this.orderRepository.findById(order.uuid) as Promise<Order>;
  }
} 