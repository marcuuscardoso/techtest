import { UUIDV4 } from "sequelize";
import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";
import User from "./user.model";

export interface IUserName {
  uuid?: string;
  userId: string;
  name: string;
  isPrimary: boolean;
}

@Table({
  tableName: "user_names",
  modelName: "UserName"
})
export default class UserName extends Model<IUserName> {
  @PrimaryKey
  @AllowNull(false)
  @Unique({
    name: "unique_user_name_uuid",
    msg: "Colisão no UUID do nome de usuário."
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
  declare public name: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare public isPrimary: boolean;

  @BelongsTo(() => User)
  declare public user: User;
} 