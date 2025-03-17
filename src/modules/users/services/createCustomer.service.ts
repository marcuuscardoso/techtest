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

interface CreateCustomerRequest {
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
  resellerId: string;
}

export class CreateCustomerService {
  private userRepository: UserRepository;
  private phoneRepository: PhoneRepository;
  private addressRepository: AddressRepository;
  private userNameRepository: UserNameRepository;
  private brasilApiService: BrasilApiService;

  constructor() {
    this.userRepository = new UserRepository();
    this.phoneRepository = new PhoneRepository();
    this.addressRepository = new AddressRepository();
    this.userNameRepository = new UserNameRepository();
    this.brasilApiService = BrasilApiService.getInstance();
  }

  private validateCustomerData(customerData: CreateCustomerRequest): void {
    const validations = [
      { condition: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email), message: "Invalid email format" },
    ];

    const failedValidation = validations.find(v => v.condition);
    if (failedValidation) {
      throw new ValidationError(failedValidation.message);
    }

    if (customerData.phones?.length) {
      customerData.phones.forEach(phone => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 9 || cleanPhone.length > 11) {
          throw new ValidationError(`Invalid phone number: ${phone}`);
        }
      });
    }
  }

  async execute(customerData: CreateCustomerRequest): Promise<User> {
    this.validateCustomerData(customerData);

    const processedData = {
      ...customerData,
      names: customerData.names.map((name, index) => ({
        ...name,
        isPrimary: name.isPrimary ?? (!customerData.names.some(n => n.isPrimary) && index === 0)
      })),
      phones: customerData.phones?.map(phone => phone.replace(/\D/g, ''))
    };

    const cnpjData = await this.brasilApiService.getCNPJ(customerData.cnpj);

    const reseller = await this.userRepository.findById(customerData.resellerId);
    if (!reseller) {
      throw new ValidationError("Reseller not found");
    }

    if (reseller.role !== EUserRole.ADMIN && reseller.role !== EUserRole.RESELLER) {
      throw new ValidationError("You don't have permission to create customers");
    }

    const customerDataToCreate: IUser = {
      email: processedData.email,
      password: await PasswordUtil.hash(processedData.password),
      cnpj: processedData.cnpj,
      legalName: cnpjData?.legalName,
      brandName: cnpjData?.tradingName,
      role: EUserRole.CUSTOMER
    };

    const customer = await this.userRepository.create(customerDataToCreate);
      
    const namesData: IUserName[] = processedData.names.map(name => ({
      userId: customer.uuid,
      name: name.name,
      isPrimary: name.isPrimary
    }));
    await this.userNameRepository.createMany(namesData);

    const addressesData: IAddress[] = processedData.addresses.map(address => ({
      userId: customer.uuid,
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
        userId: customer.uuid,
        number: phone,
      }));
      await this.phoneRepository.createMany(phonesData);
    }

    customer.password = "";

    return customer;
  }
} 