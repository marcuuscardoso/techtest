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
      cnpj: z.string().min(14, "CNPJ é obrigatório"),
      items: z.array(
       z.object({
          productId: z.string().uuid("ID do produto inválido"),
          productName: z.string().min(1, "Nome do produto é obrigatório"),
          quantity: z.number().int().positive("Quantidade deve ser maior que zero"),
        })
      ).min(1, "Pelo menos um item é obrigatório"),
      observations: z.string().optional()
    });

    const validatedData = createOrderSchema.parse(req.body);

    const order = await this.createOrderService.execute(validatedData);

    return res.status(201).json({
        orderId: order.uuid,
        items: order.items,
        status: order.status,
        observations: order.observations,
        createdAt: order.createdAt
    });
  }

  async getOrderById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const order = await this.getOrderByIdService.execute(id);

    return res.status(200).json({
        orderId: order.uuid,
        resellerId: order.resellerId,
        items: order.items,
        status: order.status,
        observations: order.observations,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
    });
  }
} 