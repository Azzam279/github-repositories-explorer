import axios, { type AxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';

interface ApiResponse<T> {
  data?: T;
  headers?: object;
  status?: number;
  message?: string;
}

const defaultConfig: AxiosRequestConfig = {
  timeout: 300000
};

function buildConfig(newConfig: AxiosRequestConfig): AxiosRequestConfig {
  return {
    ...defaultConfig,
    ...newConfig
  };
}

function onSuccess<T>(callback: (response: ApiResponse<T>) => void) {
  return (response: AxiosResponse<T>) => {
    callback({
      data: response.data,
      headers: response.headers,
      status: response.status
    });
  };
}

function onError<T>(callback: (response: ApiResponse<T>) => void) {
  return (error: AxiosError<T>) => {
    const response = error.response;
    if (response) {
      callback({
        data: response.data,
        headers: response.headers,
        status: response.status
      });
    } else {
      callback({
        message: error.message
      });
    }
  };
}

const api = {
  get<T>(url: string, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      axios.get<T>(url, buildConfig(config)).then(onSuccess(resolve)).catch(onError(reject));
    });
  },
  post<T>(url: string, data: object, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      axios.post<T>(url, data, buildConfig(config)).then(onSuccess(resolve)).catch(onError(reject));
    });
  },
  put<T>(url: string, data: object, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      axios.put<T>(url, data, buildConfig(config)).then(onSuccess(resolve)).catch(onError(reject));
    });
  },
  delete<T>(url: string, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      axios.delete<T>(url, buildConfig(config)).then(onSuccess(resolve)).catch(onError(reject));
    });
  }
};

export default api;
