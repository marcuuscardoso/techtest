import { UUIDV4 } from "sequelize";
import { AllowNull, Column, DataType, Default, HasMany, Model, PrimaryKey, Table, Unique, ForeignKey, BelongsTo } from "sequelize-typescript";
import User from "./user.model";
import OrderItem from "./orderItem.model";

export enum OrderStatus {
    PENDING = "Pending",
    PROCESSED = "Processed",
    SHIPPED = "Shipped",
    DELIVERED = "Delivered"
}

export interface IOrder {
    uuid?: string;
    resellerId: string;
    status: OrderStatus;
    observations?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

@Table({
    tableName: "orders",
    modelName: "Order"
})
export default class Order extends Model<IOrder> {
    @PrimaryKey
    @AllowNull(false)
    @Unique({
        name: "unique_order_uuid",
        msg: "Collision in order UUID."
    })
    @Default(UUIDV4)
    @Column(DataType.UUID)
    declare public uuid: string;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    declare public resellerId: string;

    @BelongsTo(() => User)
    declare public user: User;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(OrderStatus)))
    declare public status: OrderStatus;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare public observations: string;

    @HasMany(() => OrderItem)
    declare public items: OrderItem[];
} 