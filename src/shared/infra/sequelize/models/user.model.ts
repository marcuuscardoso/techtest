import { UUIDV4 } from "sequelize";
import { AllowNull, Column, DataType, Default, HasMany, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";
import Address from "./address.model";
import Phone from "./phone.model";
import UserName from "./userName.model";

export enum EUserRole {
    ADMIN = "ADMIN",
    RESELLER = "RESELLER",
    CUSTOMER = "CUSTOMER"
}

export interface IUser {
    uuid?: string;
    email: string;
    cnpj: string;
    legalName: string;
    brandName: string;
    role: EUserRole;
    password: string;
}

@Table({
    tableName: "users",
    modelName: "User"
})
export default class User extends Model<IUser> {
    @PrimaryKey
    @AllowNull(false)
    @Unique({
        name: "unique_user_uuid",
        msg: "Collision in user UUID."
    })
    @Default(UUIDV4)
    @Column(DataType.UUID)
    declare public uuid: string;

    @AllowNull(false)
    @Unique({
        name: "unique_user_email",
        msg: "This email is already in use."
    })
    @Column(DataType.STRING(100))
    declare public email: string;

    @AllowNull(false)
    @Column(DataType.STRING(256))
    declare public cnpj: string;
    
    @AllowNull(false)
    @Column(DataType.STRING(256))
    declare public legalName: string;
    
    @AllowNull(false)
    @Column(DataType.STRING(256))
    declare public brandName: string;

    @AllowNull(false)
    @Column(DataType.STRING(256))
    declare public role: EUserRole;

    @AllowNull(false)
    @Column(DataType.STRING(256))
    declare public password: string;

    @HasMany(() => Phone)
    declare public phones: Phone[];

    @HasMany(() => Address)
    declare public addresses: Address[];

    @HasMany(() => UserName)
    declare public names: UserName[];
}