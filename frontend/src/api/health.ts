import { apiClient } from './client';

export interface HealthResponse {
  success: boolean;
  service: string;
  status: string;
  timestamp: string;
  database: string;
}

export const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await apiClient.get<HealthResponse>('/health');
  return data;
};
