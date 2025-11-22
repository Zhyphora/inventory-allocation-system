import axios, { AxiosInstance } from "axios";

interface ApiResponse<T = any> {
  status: string;
  statusCode: number;
  message: string;
  data?: T;
  error?: any;
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "Testing1";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      status: "error",
      statusCode: 500,
      message: error.message || "An error occurred",
      error: error.message,
    });
  }
);

export const api = {
  products: {
    getAll: () => apiClient.get<any, ApiResponse>("/api/products"),
  },
  stocks: {
    getAll: (warehouseId?: string, productId?: string) => {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouse_id", warehouseId);
      if (productId) params.append("product_id", productId);
      const query = params.toString();
      return apiClient.get<any, ApiResponse>(
        `/api/stocks${query ? "?" + query : ""}`
      );
    },
  },
  purchaseRequests: {
    getAll: () => apiClient.get<any, ApiResponse>("/api/purchase/request"),
    getById: (id: string) =>
      apiClient.get<any, ApiResponse>(`/api/purchase/request/${id}`),
    getByReference: (reference: string) =>
      apiClient.get<any, ApiResponse>(
        `/api/purchase/request/reference/${reference}`
      ),
    create: (data: {
      warehouse_id: string;
      items: Array<{ product_id: string; quantity: number }>;
    }) => apiClient.post<any, ApiResponse>("/api/purchase/request", data),
    update: (id: string, data: { status: string }) =>
      apiClient.put<any, ApiResponse>(`/api/purchase/request/${id}`, data),
    delete: (id: string) =>
      apiClient.delete<any, ApiResponse>(`/api/purchase/request/${id}`),
  },
  webhooks: {
    receiveStock: (data: any) =>
      apiClient.post<any, ApiResponse>("/api/webhook/receive-stock", data),
  },
};

export type { ApiResponse };
export default apiClient;
