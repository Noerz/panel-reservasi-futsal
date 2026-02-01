'use client';

import { useEffect, useState } from 'react';
import { Calendar, ShoppingBag, Wallet } from 'lucide-react';
import { StatCard } from '@/components/molecules';
import { bookingService, BookingStats } from '@/services';

export function StatsGrid() {
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getBookingStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Calendar}
          title="Pesanan Hari Ini"
          value="..."
          variant="primary"
        />
        <StatCard
          icon={ShoppingBag}
          title="Pesanan Aktif"
          value="..."
          variant="default"
        />
        <StatCard
          icon={Wallet}
          title="Pendapatan Bulan Ini"
          value="..."
          variant="default"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={Calendar}
        title="Pesanan Hari Ini"
        value={`${stats.todayBookings || 0} Total Pesanan`}
        variant="primary"
      />
      <StatCard
        icon={ShoppingBag}
        title="Pesanan Aktif"
        value={`${stats.activeBookings || 0} Booking`}
        subtitle={`${stats.pendingVerification || 0} Menunggu Verifikasi`}
        variant="default"
      />
      <StatCard
        icon={Wallet}
        title="Pendapatan Bulan Ini"
        value={formatCurrency(stats.monthlyRevenue || 0)}
        subtitle={stats.revenueGrowth ? `+${stats.revenueGrowth}% vs Bulan Lalu` : 'Lebih Besar dari bulan kemarin'}
        variant="default"
      />
    </div>
  );
}
