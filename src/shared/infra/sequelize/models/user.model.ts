import { UUIDV4 } from "sequelize";
import { AllowNull, Column, DataType, Default, IsEmail, Model, NotNull, PrimaryKey, Table, Unique } from "sequelize-typescript";

export enum EUserRole {
    ADMIN = "ADMIN",
    USER = "USER"
}

export interface IUser {
    uuid?: string;
    name: string;
    email: string;
    phone: string;
    cnpj: string;
    legalName: string;
    brandName: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
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
        msg: "Colisão no UUID do usuário."
    })
    @Default(UUIDV4)
    @Column(DataType.UUID)
    declare public uuid: string;

    @AllowNull(false)
    @Column(DataType.STRING(100))
    declare public name: string;

    @AllowNull(false)
    @Column(DataType.STRING(100))
    declare public email: string;

    @AllowNull(false)
    @Column(DataType.STRING(100))
    declare public phone: string;

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
    declare public state: string;
    
    @AllowNull(false)
    @Column(DataType.STRING(256))
    declare public city: string;
    
    @AllowNull(false)
    @Column(DataType.STRING(256))
    declare public neighborhood: string;
    
    @AllowNull(false)
    @Column(DataType.STRING(256))
    declare public street: string;
    
    @AllowNull(false)
    @Column(DataType.NUMBER())
    declare public number: string;

    @AllowNull(false)
    @Column(DataType.STRING(256))
    declare public role: EUserRole;

    @AllowNull(false)
    @Column(DataType.STRING(256))
    declare public password: string;
}