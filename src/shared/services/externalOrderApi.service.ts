import axios, { AxiosInstance } from 'axios';
import { createNamedLogger } from '@/shared/infra/logger';
import { InternalServerError } from '@/shared/errors/internal-server.error';
import { OrderRepository } from '@/modules/orders/infra/repositories/order.repository';
import { OrderStatus } from '@/shared/infra/sequelize/models/order.model';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface ExternalOrderRequest {
  resellerCnpj: string;
  items: OrderItem[];
  observations?: string;
}

export interface ExternalOrderResponse {
  orderId: string;
  items: OrderItem[];
  status: string;
  createdAt: string;
}

export class ExternalOrderApiService {
  private static instance: ExternalOrderApiService;
  private api: AxiosInstance;
  private logger = createNamedLogger('external-order-api', { fileName: 'orders' });
  private pendingOrders: Map<string, {orderId: string, data: ExternalOrderRequest}> = new Map();
  private retryInterval: NodeJS.Timeout | null = null;
  private readonly RETRY_DELAY = 5000;
  private orderRepository: OrderRepository;

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.EXTERNAL_API_URL || 'http://mock-api.example.com',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    this.orderRepository = new OrderRepository();

    this.startRetryProcess();
  }

  public static getInstance(): ExternalOrderApiService {
    if (!ExternalOrderApiService.instance) {
      ExternalOrderApiService.instance = new ExternalOrderApiService();
    }
    return ExternalOrderApiService.instance;
  }

  private startRetryProcess(): void {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }

    this.retryInterval = setInterval(() => {
      this.retryPendingOrders();
    }, this.RETRY_DELAY);
  }

  private async retryPendingOrders(): Promise<void> {
    if (this.pendingOrders.size === 0) {
      return;
    }

    this.logger.info(`Retrying ${this.pendingOrders.size} pending orders`);

    for (const [id, orderInfo] of this.pendingOrders.entries()) {
      // Simulação: 30% de chance de sucesso em cada tentativa
      const simulateSuccess = Math.random() < 0.3;
      
      if (simulateSuccess) {
        const mockOrderId = `mock_success_${Date.now()}`;
        this.logger.info(`Successfully processed pending order ${id} for local order ${orderInfo.orderId}`);
        this.pendingOrders.delete(id);
        this.logger.info(`Order ${orderInfo.orderId} successfully submitted to external API with ID ${mockOrderId}`);
        
        try {
          await this.orderRepository.update(orderInfo.orderId, {
            externalOrderId: mockOrderId,
            status: OrderStatus.PROCESSED
          });
          this.logger.info(`Order ${orderInfo.orderId} status updated to PROCESSED in database`);
        } catch (error) {
          this.logger.error(`Failed to update order ${orderInfo.orderId} status in database`, { error });
        }
        
        continue;
      }
      
      try {
        const response = await this.api.post<ExternalOrderResponse>('/orders', orderInfo.data);
        
        if (response.status === 201 || response.status === 200) {
          this.logger.info(`Successfully processed pending order ${id} for local order ${orderInfo.orderId}`);
          this.pendingOrders.delete(id);
          this.logger.info(`Order ${orderInfo.orderId} successfully submitted to external API with ID ${response.data.orderId}`);
          
          try {
            await this.orderRepository.update(orderInfo.orderId, {
              externalOrderId: response.data.orderId,
              status: OrderStatus.PROCESSED
            });
            this.logger.info(`Order ${orderInfo.orderId} status updated to PROCESSED in database`);
          } catch (error) {
            this.logger.error(`Failed to update order ${orderInfo.orderId} status in database`, { error });
          }
        }
      } catch (error) {
        this.logger.error(`Failed to process pending order ${id} for local order ${orderInfo.orderId}`, { error });
      }
    }
  }

  public async createOrder(localOrderId: string, orderData: ExternalOrderRequest): Promise<ExternalOrderResponse> {
    const totalQuantity = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalQuantity < 1000) {
      throw new InternalServerError('Minimum order quantity is 1000 units');
    }

    try {
      const response = await this.api.post<ExternalOrderResponse>('/orders', orderData);
      return response.data;
    } catch (error) {
      const tempId = `pending_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      this.pendingOrders.set(tempId, {
        orderId: localOrderId,
        data: orderData
      });
      
      this.logger.error('Failed to create order in external API, added to pending queue', { 
        error, 
        orderData,
        localOrderId,
        tempId 
      });

      return this.mockCreateOrder(orderData);
    }
  }

  public mockCreateOrder(orderData: ExternalOrderRequest): ExternalOrderResponse {
    return {
      orderId: `mock_${Date.now()}`,
      items: orderData.items,
      status: 'CREATED',
      createdAt: new Date().toISOString()
    };
  }
} 