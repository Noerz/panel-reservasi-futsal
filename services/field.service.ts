import axiosInstance from '@/lib/axios';

export interface FieldPrice {
  dayType: 'WEEKDAY' | 'WEEKEND';
  startHour: number;
  endHour: number;
  price: number;
}

export interface CreateFieldPayload {
  venueId: string;
  name: string;
  type: string;
  isActive: boolean;
  lengthMeter: number;
  widthMeter: number;
  imageUrls: string[];
  prices: FieldPrice[];
}

export interface UpdateFieldPayload extends Partial<CreateFieldPayload> {
  id: string;
}

export interface FieldResponse {
  id: string;
  venueId: string;
  name: string;
  type: string;
  isActive: boolean;
  lengthMeter: number;
  widthMeter: number;
  imageUrls: string[];
  prices: FieldPrice[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FieldListResponse {
  data: FieldResponse[];
  total?: number;
  page?: number;
  limit?: number;
}

class FieldService {
  /**
   * Get all fields
   */
  async getFields(): Promise<FieldResponse[]> {
    const response = await axiosInstance.get<FieldListResponse>('/admin/fields');
    return response.data.data || response.data as any;
  }

  /**
   * Get field by ID
   */
  async getFieldById(id: string): Promise<FieldResponse> {
    const response = await axiosInstance.get<{ data: FieldResponse }>(`/admin/fields/${id}`);
    return response.data.data || response.data as any;
  }

  /**
   * Create new field
   */
  async createField(payload: CreateFieldPayload): Promise<FieldResponse> {
    const response = await axiosInstance.post<{ data: FieldResponse }>('/admin/fields', payload);
    return response.data.data || response.data as any;
  }

  /**
   * Update field
   */
  async updateField(id: string, payload: Partial<CreateFieldPayload>): Promise<FieldResponse> {
    const response = await axiosInstance.patch<{ data: FieldResponse }>(`/admin/fields/${id}`, payload);
    return response.data.data || response.data as any;
  }

  /**
   * Delete field
   */
  async deleteField(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/fields/${id}`);
  }
}

export const fieldService = new FieldService();
