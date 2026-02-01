'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Pencil, MapPin, Ruler, DollarSign, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/templates';
import { Button, Card, Badge, Text } from '@/components/atoms';
import { useAuthStore, useFieldStore } from '@/stores';
import type { Field } from '@/stores/fieldStore';
import { fieldService } from '@/services';

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

const defaultImage =
  'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60';

export default function FieldDetailPage() {
  const router = useRouter();
  const params = useParams();
  const fieldId = params.id as string;

  const { isAuthenticated, initialized, checkAuth } = useAuthStore();
  const [field, setField] = useState<Field | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [initialized, isAuthenticated, router]);

  useEffect(() => {
    if (initialized && isAuthenticated && fieldId) {
      loadFieldDetail();
    }
  }, [initialized, isAuthenticated, fieldId]);

  const loadFieldDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fieldService.getFieldById(fieldId);
      setField(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat detail lapangan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/fields/${fieldId}/edit`);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Lapangan" breadcrumb={['Admin', 'Kelola Lapangan', 'Detail']}>
        <Card>
          <Text variant="body" className="text-gray-600">
            Memuat data...
          </Text>
        </Card>
      </DashboardLayout>
    );
  }

  if (error || !field) {
    return (
      <DashboardLayout title="Detail Lapangan" breadcrumb={['Admin', 'Kelola Lapangan', 'Detail']}>
        <Card className="bg-red-50 border-red-200">
          <Text variant="body" className="text-red-700">
            {error || 'Lapangan tidak ditemukan'}
          </Text>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/fields')}>
            Kembali
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={field.name}
      breadcrumb={['Admin', 'Kelola Lapangan', field.name]}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/fields')}
          >
            <ArrowLeft size={18} />
            Kembali
          </Button>

          <div className="flex gap-3">
            <Button onClick={handleEdit}>
              <Pencil size={18} />
              Edit Lapangan
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <Badge variant={field.isActive ? 'success' : 'error'} className="text-base px-4 py-2">
            {field.isActive ? 'Lapangan Aktif' : 'Lapangan Tidak Aktif'}
          </Badge>
        </div>

        {/* Images Gallery */}
        {field.imageUrls && field.imageUrls.length > 0 && (
          <Card padding="none" className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {field.imageUrls.map((url, idx) => (
                <div key={idx} className="relative h-64 rounded-xl overflow-hidden">
                  <Image
                    src={url}
                    alt={`${field.name} - ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <Text variant="h4" className="mb-4 font-bold">
              Informasi Lapangan
            </Text>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary mt-1" />
                <div>
                  <Text variant="caption" className="text-gray-500">
                    Tipe Lapangan
                  </Text>
                  <Text variant="body" className="font-medium">
                    {field.type}
                  </Text>
                </div>
              </div>

              {field.lengthMeter && field.widthMeter && (
                <div className="flex items-start gap-3">
                  <Ruler size={20} className="text-primary mt-1" />
                  <div>
                    <Text variant="caption" className="text-gray-500">
                      Ukuran Lapangan
                    </Text>
                    <Text variant="body" className="font-medium">
                      {field.lengthMeter}m x {field.widthMeter}m
                    </Text>
                  </div>
                </div>
              )}

              {field.venueId && (
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary mt-1" />
                  <div>
                    <Text variant="caption" className="text-gray-500">
                      Venue ID
                    </Text>
                    <Text variant="body" className="font-medium font-mono text-xs">
                      {field.venueId}
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Price Info */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-primary" />
              <Text variant="h4" className="font-bold">
                Daftar Harga
              </Text>
            </div>

            {field.prices && field.prices.length > 0 ? (
              <div className="space-y-3">
                {field.prices.map((price, idx) => (
                  <Card key={idx} className="bg-gray-50" padding="sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-gray-500" />
                        <div>
                          <Text variant="body-sm" className="font-medium">
                            {price.dayType === 'WEEKDAY' ? 'Hari Kerja' : 'Akhir Pekan'}
                          </Text>
                          <Text variant="caption" className="text-gray-500">
                            {price.startHour}:00 - {price.endHour}:00
                          </Text>
                        </div>
                      </div>
                      <Text variant="body" className="font-bold text-primary">
                        {formatRupiah(price.price)}
                      </Text>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Text variant="body" className="text-gray-500">
                Belum ada harga yang ditentukan
              </Text>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
