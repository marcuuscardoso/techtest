import { ApiUtil } from '../utils/api.util';
import { ValidationError } from '@/shared/errors/validation.error';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { TooManyRequestsError } from '@/shared/errors/too-many-requests.error';
import { InternalServerError } from '@/shared/errors/internal-server.error';

interface BrasilApiCNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
}

export interface CNPJResponse {
  cnpj: string;
  legalName: string;
  tradingName: string;
}

export class BrasilApiService {
  private static instance: BrasilApiService;
  private apiUtil: ApiUtil;
  private readonly API_NAME = 'brasil-api';

  private constructor() {
    this.apiUtil = ApiUtil.getInstance();
    this.setupApi();
  }

  private setupApi(): void {
    this.apiUtil.setupApi(this.API_NAME, {
      baseURL: 'https://brasilapi.com.br/api',
      timeout: 15000
    });
  }

  public static getInstance(): BrasilApiService {
    if (!BrasilApiService.instance) {
      BrasilApiService.instance = new BrasilApiService();
    }
    return BrasilApiService.instance;
  }

  public async getCNPJ(cnpj: string): Promise<CNPJResponse> {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (cleanCNPJ.length !== 14) {
      throw new ValidationError('CNPJ must contain 14 numeric digits');
    }

    try {
      const response = await this.apiUtil.get<BrasilApiCNPJResponse>(
        this.API_NAME,
        `/cnpj/v1/${cleanCNPJ}`
      );
      
      // Map the Portuguese field names to English
      const mappedResponse: CNPJResponse = {
        cnpj: response.data.cnpj,
        legalName: response.data.razao_social,
        tradingName: response.data.nome_fantasia
      };
      
      return mappedResponse;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundError('CNPJ not found or invalid');
      }
      if (error.response?.status === 429) {
        throw new TooManyRequestsError('Request limit exceeded. Please try again later');
      }
      throw new InternalServerError(`Error querying CNPJ: ${error.message || 'Unknown error'}`);
    }
  }
} 