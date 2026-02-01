import { create } from 'zustand';
import { fieldService, FieldResponse, CreateFieldPayload } from '@/services';

export interface FieldPrice {
  dayType: 'WEEKDAY' | 'WEEKEND';
  startHour: number;
  endHour: number;
  price: number;
}

export interface Field {
  id: string;
  venueId?: string;
  name: string;
  type: string;
  isActive: boolean;
  lengthMeter?: number;
  widthMeter?: number;
  imageUrls?: string[];
  prices?: FieldPrice[];
  // Legacy fields for backward compatibility
  pricePerHour?: number;
  isAvailable?: boolean;
  image?: string;
}

interface FieldState {
  fields: Field[];
  selectedField: Field | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchFields: () => Promise<void>;
  setFields: (fields: Field[]) => void;
  addField: (payload: CreateFieldPayload) => Promise<void>;
  updateField: (id: string, payload: Partial<CreateFieldPayload>) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
  selectField: (field: Field | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFieldStore = create<FieldState>((set, get) => ({
  fields: [],
  selectedField: null,
  isLoading: false,
  error: null,

  fetchFields: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fieldService.getFields();
      set({ fields: data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memuat data lapangan';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setFields: (fields) => set({ fields }),
  
  addField: async (payload: CreateFieldPayload) => {
    set({ isLoading: true, error: null });
    try {
      const newField = await fieldService.createField(payload);
      set((state) => ({
        fields: [...state.fields, newField],
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menambah lapangan';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  updateField: async (id: string, payload: Partial<CreateFieldPayload>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedField = await fieldService.updateField(id, payload);
      set((state) => ({
        fields: state.fields.map((f) => (f.id === id ? updatedField : f)),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal update lapangan';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  deleteField: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await fieldService.deleteField(id);
      set((state) => ({
        fields: state.fields.filter((f) => f.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus lapangan';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  selectField: (field) => set({ selectedField: field }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
}));
