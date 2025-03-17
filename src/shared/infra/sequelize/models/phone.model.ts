import { UUIDV4 } from "sequelize";
import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";
import User from "./user.model";

export interface IPhone {
  uuid?: string;
  userId: string;
  number: string;
}

@Table({
  tableName: "phones",
  modelName: "Phone"
})
export default class Phone extends Model<IPhone> {
  @PrimaryKey
  @AllowNull(false)
  @Unique({
    name: "unique_phone_uuid",
    msg: "Collision in phone UUID."
  })
  @Default(UUIDV4)
  @Column(DataType.UUID)
  declare public uuid: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare public userId: string;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare public number: string;

  @BelongsTo(() => User)
  declare public user: User;
} 