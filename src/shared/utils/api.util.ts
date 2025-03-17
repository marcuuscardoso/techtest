import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createNamedLogger } from '@/shared/infra/logger';
import { InternalServerError } from '@/shared/errors/internal-server.error';

interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiUtil {
  private static instance: ApiUtil;
  private apiInstances: Map<string, AxiosInstance> = new Map();
  private logger = createNamedLogger('api-util', { fileName: 'api' });

  public static getInstance(): ApiUtil {
    if (!ApiUtil.instance) {
      ApiUtil.instance = new ApiUtil();
    }
    return ApiUtil.instance;
  }

  /**
   * Configura uma nova instância de API
   * @param name Nome único para identificar esta API
   * @param config Configuração da API
   */
  public setupApi(name: string, config: ApiConfig): void {
    if (this.apiInstances.has(name)) {
      this.logger.warn(`API com nome "${name}" já existe e será sobrescrita`);
    }

    const instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    instance.interceptors.request.use(
      (config) => {
        this.logger.info(`Requisição para ${name}: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error(`Erro na requisição para ${name}:`, error);
        return Promise.reject(new InternalServerError(`Erro na requisição para ${name}: ${error.message}`));
      }
    );

    instance.interceptors.response.use(
      (response) => {
        this.logger.info(`Resposta de ${name}: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        this.logger.error(`Erro na resposta de ${name}:`, error.response || error);
        return Promise.reject(error);
      }
    );

    this.apiInstances.set(name, instance);
  }

  /**
   * Obtém uma instância de API configurada
   * @param name Nome da API
   */
  public getApi(name: string): AxiosInstance {
    const api = this.apiInstances.get(name);
    if (!api) {
      throw new InternalServerError(`API com nome "${name}" não encontrada. Configure-a primeiro com setupApi()`);
    }
    return api;
  }

  /**
   * Faz uma requisição GET
   * @param apiName Nome da API
   * @param url URL da requisição (relativa à baseURL)
   * @param config Configurações adicionais
   */
  public async get<T = any>(apiName: string, url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.getApi(apiName).get<T>(url, config);
  }

  /**
   * Faz uma requisição POST
   * @param apiName Nome da API
   * @param url URL da requisição (relativa à baseURL)
   * @param data Dados a serem enviados
   * @param config Configurações adicionais
   */
  public async post<T = any>(apiName: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.getApi(apiName).post<T>(url, data, config);
  }

  /**
   * Faz uma requisição PUT
   * @param apiName Nome da API
   * @param url URL da requisição (relativa à baseURL)
   * @param data Dados a serem enviados
   * @param config Configurações adicionais
   */
  public async put<T = any>(apiName: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.getApi(apiName).put<T>(url, data, config);
  }

  /**
   * Faz uma requisição PATCH
   * @param apiName Nome da API
   * @param url URL da requisição (relativa à baseURL)
   * @param data Dados a serem enviados
   * @param config Configurações adicionais
   */
  public async patch<T = any>(apiName: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.getApi(apiName).patch<T>(url, data, config);
  }

  /**
   * Faz uma requisição DELETE
   * @param apiName Nome da API
   * @param url URL da requisição (relativa à baseURL)
   * @param config Configurações adicionais
   */
  public async delete<T = any>(apiName: string, url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.getApi(apiName).delete<T>(url, config);
  }
} 