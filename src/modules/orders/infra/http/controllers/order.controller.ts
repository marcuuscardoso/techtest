import { Request, Response } from "express";
import { CreateOrderService } from "@/modules/orders/services/createOrder.service";
import { GetOrderByIdService } from "@/modules/orders/services/getOrderById.service";
import { z } from "zod";

export class OrderController {
  private createOrderService: CreateOrderService;
  private getOrderByIdService: GetOrderByIdService;

  constructor() {
    this.createOrderService = new CreateOrderService();
    this.getOrderByIdService = new GetOrderByIdService();
  }

  async createOrder(req: Request, res: Response): Promise<Response> {
    const createOrderSchema = z.object({
      cnpj: z.string().min(14, "CNPJ is required"),
      items: z.array(
       z.object({
          productId: z.string().uuid("Invalid product ID"),
          productName: z.string().min(1, "Product name is required"),
          quantity: z.number().int().positive("Quantity must be greater than zero"),
        })
      ).min(1, "At least one item is required"),
      observations: z.string().optional()
    });

    const validatedData = createOrderSchema.parse(req.body);

    const order = await this.createOrderService.execute(validatedData);

    const response = {
      orderId: order.uuid,
      items: order.items,
      status: order.status,
      observations: order.observations,
      createdAt: order.createdAt
    };

    // Adicionar o ID do pedido externo se disponível
    if (order.externalOrderId) {
      Object.assign(response, { externalOrderId: order.externalOrderId });
    }

    return res.status(201).json(response);
  }

  async getOrderById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const order = await this.getOrderByIdService.execute(id);

    const response = {
      orderId: order.uuid,
      resellerId: order.resellerId,
      items: order.items,
      status: order.status,
      observations: order.observations,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    // Adicionar o ID do pedido externo se disponível
    if (order.externalOrderId) {
      Object.assign(response, { externalOrderId: order.externalOrderId });
    }

    return res.status(200).json(response);
  }
} 