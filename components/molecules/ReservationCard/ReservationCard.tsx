'use client';

import { Avatar, Badge, Button, Card, Text } from '@/components/atoms';

export interface ReservationData {
  id: string;
  customerName: string;
  orderId: string;
  field: string;
  time: string;
  date: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface ReservationCardProps {
  reservation: ReservationData;
  onVerify?: (id: string) => void;
}

export function ReservationCard({ reservation, onVerify }: ReservationCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <Avatar size="xl" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Text variant="body" className="font-semibold">
              {reservation.customerName}
            </Text>
          </div>
          <Text variant="body-sm" color="primary" className="font-medium">
            ID Pesanan #{reservation.orderId}
          </Text>
          <div className="flex items-center gap-4 mt-1">
            <Text variant="caption" color="muted">
              {reservation.field}
            </Text>
            <Text variant="caption" color="muted">
              {reservation.date} • {reservation.time}
            </Text>
          </div>
        </div>
        <div className="text-right flex items-center gap-6">
          <Text variant="h4" className="font-semibold">
            {formatPrice(reservation.price)}
          </Text>
          {reservation.status === 'pending' && onVerify && (
            <Button variant="outline" size="sm" onClick={() => onVerify(reservation.id)}>
              Periksa Bukti
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
