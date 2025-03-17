import { UUIDV4 } from "sequelize";
import { AllowNull, Column, DataType, Default, Model, PrimaryKey, Table, Unique, ForeignKey, BelongsTo } from "sequelize-typescript";
import Order from "./order.model";

export interface IOrderItem {
    uuid?: string;
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
}

@Table({
    tableName: "order_items",
    modelName: "OrderItem"
})
export default class OrderItem extends Model<IOrderItem> {
    @PrimaryKey
    @AllowNull(false)
    @Unique({
        name: "unique_order_item_uuid",
        msg: "Collision in order item UUID."
    })
    @Default(UUIDV4)
    @Column(DataType.UUID)
    declare public uuid: string;

    @AllowNull(false)
    @ForeignKey(() => Order)
    @Column(DataType.UUID)
    declare public orderId: string;

    @BelongsTo(() => Order)
    declare public order: Order;

    @AllowNull(false)
    @Column(DataType.UUID)
    declare public productId: string;

    @AllowNull(false)
    @Column(DataType.STRING(256))
    declare public productName: string;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare public quantity: number;
} 