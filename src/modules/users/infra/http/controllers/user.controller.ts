import { GetAllUsersService } from "@/modules/users/services/getAllUsers.service";
import { GetUserByIdService } from "@/modules/users/services/getUserById.service";
import { CreateUserService } from "@/modules/users/services/createUser.service";
import { UpdateUserService } from "@/modules/users/services/updateUser.service";
import { DeleteUserService } from "@/modules/users/services/deleteUser.service";
import { Request, Response } from "express";
import { z } from "zod";

export class UserController {
  private getAllUsersService: GetAllUsersService;
  private getUserByIdService: GetUserByIdService;
  private createUserService: CreateUserService;
  private updateUserService: UpdateUserService;
  private deleteUserService: DeleteUserService;

  constructor() {
    this.getAllUsersService = new GetAllUsersService();
    this.getUserByIdService = new GetUserByIdService();
    this.createUserService = new CreateUserService();
    this.updateUserService = new UpdateUserService();
    this.deleteUserService = new DeleteUserService();
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
      name: z.string().min(1).max(100),
      email: z.string().email().max(100),
      phone: z.string().min(1).max(100),
      cnpj: z.string().min(1).max(256),
      state: z.string().min(1).max(256),
      city: z.string().min(1).max(256),
      neighborhood: z.string().min(1).max(256),
      street: z.string().min(1).max(256),
      number: z.string().min(1).max(256),
      password: z.string().min(6).max(100)
    }).strict();

    const userData = bodySchema.parse(req.body);

    const user = await this.createUserService.execute(userData);

    const { password, ...userWithoutPassword } = user.toJSON();

    return res
      .status(201)
      .json(userWithoutPassword);
  }

  async updateUser(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid()
    });

    const { id } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      name: z.string().min(1).max(100).optional(),
      email: z.string().email().max(100).optional(),
      phone: z.string().min(1).max(100).optional(),
      state: z.string().min(1).max(256).optional(),
      city: z.string().min(1).max(256).optional(),
      neighborhood: z.string().min(1).max(256).optional(),
      street: z.string().min(1).max(256).optional(),
      number: z.string().min(1).max(256).optional(),
    }).strict();

    const userData = bodySchema.parse(req.body);

    const updatedUser = await this.updateUserService.execute(id, userData);

    const { password, ...userWithoutPassword } = updatedUser.toJSON();

    return res
      .status(200)
      .json(userWithoutPassword);
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
} 