import { ApiUtil } from '../utils/api.util';
import { ValidationError } from '@/shared/errors/validation.error';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { TooManyRequestsError } from '@/shared/errors/too-many-requests.error';
import { InternalServerError } from '@/shared/errors/internal-server.error';

export interface CNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
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
      throw new ValidationError('CNPJ deve conter 14 dígitos numéricos');
    }

    try {
      const response = await this.apiUtil.get<CNPJResponse>(
        this.API_NAME,
        `/cnpj/v1/${cleanCNPJ}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundError('CNPJ não encontrado ou inválido');
      }
      if (error.response?.status === 429) {
        throw new TooManyRequestsError('Limite de requisições excedido. Tente novamente mais tarde');
      }
      throw new InternalServerError(`Erro ao consultar CNPJ: ${error.message || 'Erro desconhecido'}`);
    }
  }
} 