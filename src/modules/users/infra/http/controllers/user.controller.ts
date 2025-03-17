import { GetAllUsersService } from "@/modules/users/services/getAllUsers.service";
import { GetUserByIdService } from "@/modules/users/services/getUserById.service";
import { CreateUserService } from "@/modules/users/services/createUser.service";
import { UpdateUserService } from "@/modules/users/services/updateUser.service";
import { DeleteUserService } from "@/modules/users/services/deleteUser.service";
import { CreateCustomerService } from "@/modules/users/services/createCustomer.service";
import { Request, Response } from "express";
import { z } from "zod";

export class UserController {
  private getAllUsersService: GetAllUsersService;
  private getUserByIdService: GetUserByIdService;
  private createUserService: CreateUserService;
  private updateUserService: UpdateUserService;
  private deleteUserService: DeleteUserService;
  private createCustomerService: CreateCustomerService;

  constructor() {
    this.getAllUsersService = new GetAllUsersService();
    this.getUserByIdService = new GetUserByIdService();
    this.createUserService = new CreateUserService();
    this.updateUserService = new UpdateUserService();
    this.deleteUserService = new DeleteUserService();
    this.createCustomerService = new CreateCustomerService();
  }

  async getAllUsers(req: Request, res: Response) {
    const users = await this.getAllUsersService.execute();

    return res
      .status(200)
      .json(users);
  }

  async getUserById(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid()
    });

    const { id } = paramsSchema.parse(req.params);

    const user = await this.getUserByIdService.execute(id);

    return res
      .status(200)
      .json(user);
  }

  async createUser(req: Request, res: Response) {
    const bodySchema = z.object({
      email: z.string().email().max(100),
      password: z.string().min(6).max(100),
      cnpj: z.string().min(1).max(256),
      names: z.array(z.object({
        name: z.string().min(1).max(100),
        isPrimary: z.boolean().optional()
      })).min(1),
      phones: z.array(z.string().min(10).max(20)).optional(),
      addresses: z.array(z.object({
        state: z.string().min(1).max(100),
        city: z.string().min(1).max(100),
        neighborhood: z.string().min(1).max(100),
        street: z.string().min(1).max(255),
        number: z.string().min(1).max(20),
        complement: z.string().max(255).optional(),
        zipCode: z.string().min(1).max(20),
      })).min(1)
    }).strict();

    const userData = bodySchema.parse(req.body);

    const user = await this.createUserService.execute(userData);

    return res
      .status(201)
      .json(user);
  }

  async updateUser(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid()
    });

    const { id } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      email: z.string().email().max(100).optional(),
    }).strict();

    const userData = bodySchema.parse(req.body);

    const updatedUser = await this.updateUserService.execute(id, userData);

    return res
      .status(200)
      .json(updatedUser);
  }

  async deleteUser(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid()
    });

    const { id } = paramsSchema.parse(req.params);

    await this.deleteUserService.execute(id);

    return res
      .status(204)
      .send();
  }

  async createCustomer(req: Request, res: Response) {
    const bodySchema = z.object({
      email: z.string().email().max(100),
      password: z.string().min(6).max(100),
      cnpj: z.string().min(1).max(256),
      names: z.array(z.object({
        name: z.string().min(1).max(100),
        isPrimary: z.boolean().optional()
      })).min(1),
      phones: z.array(z.string().min(10).max(20)).optional(),
      addresses: z.array(z.object({
        state: z.string().min(1).max(100),
        city: z.string().min(1).max(100),
        neighborhood: z.string().min(1).max(100),
        street: z.string().min(1).max(255),
        number: z.string().min(1).max(20),
        complement: z.string().max(255).optional(),
        zipCode: z.string().min(1).max(20),
      })).min(1)
    }).strict();

    const customerData = bodySchema.parse(req.body);
    
    const resellerId = req.user.uuid;
    
    const customer = await this.createCustomerService.execute({
      ...customerData,
      resellerId
    });

    return res
      .status(201)
      .json(customer);
  }
} 