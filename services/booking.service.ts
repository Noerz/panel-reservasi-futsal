import axiosInstance from '@/lib/axios';

export interface BookingPayload {
  fieldId: string;
  userId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  paymentProof?: string;
}

export interface BookingResponse {
  id: string;
  customerId: string;
  fieldId: string;
  startTime: string;
  endTime: string;
  status: 'WAITING_PAYMENT' | 'WAITING_VERIFICATION' | 'PAID' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  field: {
    id: string;
    name: string;
    type: string;
    venue: {
      id: string;
      name: string;
    };
  };
  payment?: {
    id: string;
    proofUrl: string | null;
    status: 'WAITING_PAYMENT' | 'WAITING_VERIFICATION' | 'APPROVED' | 'REJECTED';
    verifiedAt: string | null;
    verifiedBy: string | null;
    note: string | null;
  };
}

export interface BookingStats {
  todayBookings: number;
  activeBookings: number;
  monthlyRevenue: number;
  pendingVerification: number;
  revenueGrowth?: number;
}

class BookingService {
  /**
   * Get all bookings with optional filters
   */
  async getBookings(params?: {
    status?: string;
    date?: string;
    fieldId?: string;
    today?: boolean;
  }): Promise<BookingResponse[]> {
    const response = await axiosInstance.get<{ data: BookingResponse[] }>('/admin/bookings', {
      params,
    });
    return response.data.data || response.data as any;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<BookingResponse> {
    const response = await axiosInstance.get<{ data: BookingResponse }>(`/admin/bookings/${id}`);
    return response.data.data || response.data as any;
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(): Promise<BookingStats> {
    const response = await axiosInstance.get<{ data: BookingStats }>('/admin/bookings/stats');
    return response.data.data || response.data as any;
  }

/**
 * Verify booking payment
 */
async verifyBooking(
  id: string,
  approved: boolean,
  note?: string
): Promise<BookingResponse> {
  const response = await axiosInstance.patch<{ data: BookingResponse }>(
    `/admin/bookings/verify-payment/${id}`,
    { approved, note }
  );
  return response.data.data || response.data as any;
}

  /**
   * Update booking status
   */
  async updateBookingStatus(
    id: string,
    status: 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  ): Promise<BookingResponse> {
    const response = await axiosInstance.patch<{ data: BookingResponse }>(
      `/admin/bookings/${id}/status`,
      { status }
    );
    return response.data.data || response.data as any;
  }

  /**
   * Delete booking
   */
  async deleteBooking(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/bookings/${id}`);
  }
}

export const bookingService = new BookingService();
