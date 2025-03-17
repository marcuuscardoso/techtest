import { UserRepository } from "../infra/repositories/user.repository";
import { PhoneRepository } from "../infra/repositories/phone.repository";
import { AddressRepository } from "../infra/repositories/address.repository";
import { UserNameRepository } from "../infra/repositories/userName.repository";
import User, { EUserRole, IUser } from "@/shared/infra/sequelize/models/user.model";
import { IPhone } from "@/shared/infra/sequelize/models/phone.model";
import { IAddress } from "@/shared/infra/sequelize/models/address.model";
import { IUserName } from "@/shared/infra/sequelize/models/userName.model";
import { ValidationError } from "@/shared/errors/validation.error";
import { PasswordUtil } from "@/shared/utils/password.util";
import { BrasilApiService } from "@/shared/services/brasilApi.service";
import { createNamedLogger } from "@/shared/infra/logger";
import { sequelize } from "@/shared/infra/sequelize";

interface CreateUserRequest {
  email: string;
  password: string;
  cnpj: string;
  names: {
    name: string;
    isPrimary?: boolean;
  }[];
  phones?: Array<string>;
  addresses: {
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    complement?: string;
    zipCode: string;
  }[];
}

export class CreateUserService {
  private userRepository: UserRepository;
  private phoneRepository: PhoneRepository;
  private addressRepository: AddressRepository;
  private userNameRepository: UserNameRepository;
  private brasilApiService: BrasilApiService;
  private logger = createNamedLogger('create-user-service', { fileName: 'users' });

  constructor() {
    this.userRepository = new UserRepository();
    this.phoneRepository = new PhoneRepository();
    this.addressRepository = new AddressRepository();
    this.userNameRepository = new UserNameRepository();
    this.brasilApiService = BrasilApiService.getInstance();
  }

  private validateUserData(userData: CreateUserRequest): void {
    const validations = [
      { condition: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email), message: "Invalid email format" },
    ];

    const failedValidation = validations.find(v => v.condition);
    if (failedValidation) {
      throw new ValidationError(failedValidation.message);
    }

    if (userData.phones?.length) {
      userData.phones.forEach(phone => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 9 || cleanPhone.length > 11) {
          throw new ValidationError(`Invalid phone number: ${phone}`);
        }
      });
    }
  }

  async execute(userData: CreateUserRequest): Promise<User> {
    this.validateUserData(userData);

    const processedData = {
      ...userData,
      names: userData.names.map((name, index) => ({
        ...name,
        isPrimary: name.isPrimary ?? (!userData.names.some(n => n.isPrimary) && index === 0)
      })),
      phones: userData.phones?.map(phone => phone.replace(/\D/g, ''))
    };

    const cnpjData = await this.brasilApiService.getCNPJ(userData.cnpj);

    const transaction = await sequelize.transaction();

    const userDataToCreate: IUser = {
      email: processedData.email,
      password: await PasswordUtil.hash(processedData.password),
      cnpj: processedData.cnpj,
      legalName: cnpjData?.legalName,
      brandName: cnpjData?.tradingName,
      role: EUserRole.RESELLER
    };

    const user = await this.userRepository.create(userDataToCreate);
    
    const namesData: IUserName[] = processedData.names.map(name => ({
      userId: user.uuid,
      name: name.name,
      isPrimary: name.isPrimary
    }));
    await this.userNameRepository.createMany(namesData);

    const addressesData: IAddress[] = processedData.addresses.map(address => ({
      userId: user.uuid,
      state: address.state,
      city: address.city,
      neighborhood: address.neighborhood,
      street: address.street,
      number: address.number,
      complement: address.complement,
      zipCode: address.zipCode,
    }));
    await this.addressRepository.createMany(addressesData);

    if (processedData.phones?.length) {
      const phonesData: IPhone[] = processedData.phones.map(phone => ({
        userId: user.uuid,
        number: phone,
      }));
      await this.phoneRepository.createMany(phonesData);
    }

    await transaction.commit();

    return user;
  }
}