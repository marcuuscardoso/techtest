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
   * Sets up a new API instance
   * @param name Unique name to identify this API
   * @param config API configuration
   */
  public setupApi(name: string, config: ApiConfig): void {
    if (this.apiInstances.has(name)) {
      this.logger.warn(`API with name "${name}" already exists and will be overwritten`);
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
        this.logger.info(`Request to ${name}: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error(`Error in request to ${name}:`, error);
        return Promise.reject(new InternalServerError(`Error in request to ${name}: ${error.message}`));
      }
    );

    instance.interceptors.response.use(
      (response) => {
        this.logger.info(`Response from ${name}: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        this.logger.error(`Error in response from ${name}:`, error.response || error);
        return Promise.reject(error);
      }
    );

    this.apiInstances.set(name, instance);
  }

  /**
   * Gets a configured API instance
   * @param name API name
   */
  public getApi(name: string): AxiosInstance {
    const api = this.apiInstances.get(name);
    if (!api) {
      throw new InternalServerError(`API with name "${name}" not found. Configure it first with setupApi()`);
    }
    return api;
  }

  /**
   * Makes a GET request
   * @param apiName API name
   * @param url Request URL (relative to baseURL)
   * @param config Additional configurations
   */
  public async get<T = any>(apiName: string, url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.getApi(apiName).get<T>(url, config);
  }

  /**
   * Makes a POST request
   * @param apiName API name
   * @param url Request URL (relative to baseURL)
   * @param data Data to be sent
   * @param config Additional configurations
   */
  public async post<T = any>(apiName: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.getApi(apiName).post<T>(url, data, config);
  }

  /**
   * Makes a PUT request
   * @param apiName API name
   * @param url Request URL (relative to baseURL)
   * @param data Data to be sent
   * @param config Additional configurations
   */
  public async put<T = any>(apiName: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.getApi(apiName).put<T>(url, data, config);
  }

  /**
   * Makes a PATCH request
   * @param apiName API name
   * @param url Request URL (relative to baseURL)
   * @param data Data to be sent
   * @param config Additional configurations
   */
  public async patch<T = any>(apiName: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.getApi(apiName).patch<T>(url, data, config);
  }

  /**
   * Makes a DELETE request
   * @param apiName API name
   * @param url Request URL (relative to baseURL)
   * @param config Additional configurations
   */
  public async delete<T = any>(apiName: string, url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.getApi(apiName).delete<T>(url, config);
  }
} 