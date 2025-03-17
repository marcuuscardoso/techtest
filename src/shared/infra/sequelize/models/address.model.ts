import { UUIDV4 } from "sequelize";
import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";
import User from "./user.model";

export interface IAddress {
  uuid?: string;
  userId: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement?: string;
  zipCode: string;
}

@Table({
  tableName: "addresses",
  modelName: "Address"
})
export default class Address extends Model<IAddress> {
  @PrimaryKey
  @AllowNull(false)
  @Unique({
    name: "unique_address_uuid",
    msg: "Colisão no UUID do endereço."
  })
  @Default(UUIDV4)
  @Column(DataType.UUID)
  declare public uuid: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare public userId: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare public state: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare public city: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare public neighborhood: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare public street: string;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare public number: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare public complement: string;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare public zipCode: string;

  @BelongsTo(() => User)
  declare public user: User;
} 