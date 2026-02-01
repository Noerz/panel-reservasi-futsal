import { create } from 'zustand';
import { ReservationData } from '@/components/molecules/ReservationCard';

interface ReservationStats {
  todayOrders: number;
  activeBookings: number;
  pendingVerification: number;
  monthlyRevenue: number;
}

interface ReservationState {
  reservations: ReservationData[];
  stats: ReservationStats;
  selectedReservation: ReservationData | null;
  
  // Actions
  setReservations: (reservations: ReservationData[]) => void;
  addReservation: (reservation: ReservationData) => void;
  updateReservation: (id: string, data: Partial<ReservationData>) => void;
  deleteReservation: (id: string) => void;
  selectReservation: (reservation: ReservationData | null) => void;
  verifyReservation: (id: string) => void;
  updateStats: (stats: Partial<ReservationStats>) => void;
}

// Initial mock data
const initialReservations: ReservationData[] = [
  {
    id: '1',
    customerName: 'Afrizal Prayogi',
    orderId: '1010',
    field: 'Lapangan A',
    time: '2 jam',
    date: '08:00 WIB',
    price: 300000,
    status: 'pending',
  },
  {
    id: '2',
    customerName: 'Afrizal Prayogi',
    orderId: '1010',
    field: 'Main Stadium',
    time: '1 jam',
    date: '10:00 WIB',
    price: 300000,
    status: 'pending',
  },
  {
    id: '3',
    customerName: 'Afrizal Prayogi',
    orderId: '1010',
    field: 'Lapangan B',
    time: '1 jam',
    date: '14:00 WIB',
    price: 300000,
    status: 'pending',
  },
];

const initialStats: ReservationStats = {
  todayOrders: 38,
  activeBookings: 12,
  pendingVerification: 4,
  monthlyRevenue: 1500000,
};

export const useReservationStore = create<ReservationState>((set) => ({
  reservations: initialReservations,
  stats: initialStats,
  selectedReservation: null,

  setReservations: (reservations) => set({ reservations }),
  
  addReservation: (reservation) =>
    set((state) => ({
      reservations: [...state.reservations, reservation],
    })),
  
  updateReservation: (id, data) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
    })),
  
  deleteReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    })),
  
  selectReservation: (reservation) => set({ selectedReservation: reservation }),
  
  verifyReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, status: 'confirmed' } : r
      ),
      stats: {
        ...state.stats,
        pendingVerification: Math.max(0, state.stats.pendingVerification - 1),
      },
    })),
  
  updateStats: (stats) =>
    set((state) => ({
      stats: { ...state.stats, ...stats },
    })),
}));
