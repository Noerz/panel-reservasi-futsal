'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/templates';
import { Button, Card, Input, Text } from '@/components/atoms';
import { useAuthStore, useFieldStore } from '@/stores';
import type { Field, FieldPrice } from '@/stores/fieldStore';
import { fieldService } from '@/services';

type FieldFormState = {
  venueId: string;
  name: string;
  type: string;
  isActive: boolean;
  lengthMeter: string;
  widthMeter: string;
  imageUrls: string[];
  prices: FieldPrice[];
};

type PriceFormRow = {
  id: string;
  dayType: 'WEEKDAY' | 'WEEKEND';
  startHour: string;
  endHour: string;
  price: string;
};

const defaultImage =
  'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60';

const DEFAULT_VENUE_ID = '794ac37d-2f68-4411-865e-ba5410c6b931';

export default function EditFieldPage() {
  const router = useRouter();
  const params = useParams();
  const fieldId = params.id as string;

  const { isAuthenticated, initialized, checkAuth } = useAuthStore();
  const { updateField, isLoading } = useFieldStore();

  const [form, setForm] = useState<FieldFormState>({
    venueId: DEFAULT_VENUE_ID,
    name: '',
    type: 'SYNTHETIC',
    isActive: true,
    lengthMeter: '48',
    widthMeter: '25',
    imageUrls: [],
    prices: [],
  });

  const [imageInput, setImageInput] = useState('');
  const [priceRows, setPriceRows] = useState<PriceFormRow[]>([]);
  const [formError, setFormError] = useState<string>('');
  const [loadError, setLoadError] = useState<string>('');

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
      loadFieldData();
    }
  }, [initialized, isAuthenticated, fieldId]);

  const loadFieldData = async () => {
    try {
      const field = await fieldService.getFieldById(fieldId);
      setForm({
        venueId: field.venueId || DEFAULT_VENUE_ID,
        name: field.name,
        type: field.type || 'SYNTHETIC',
        isActive: field.isActive ?? true,
        lengthMeter: String(field.lengthMeter || 48),
        widthMeter: String(field.widthMeter || 25),
        imageUrls: field.imageUrls || [],
        prices: field.prices || [],
      });

      const rows: PriceFormRow[] = (field.prices || []).map((p, i) => ({
        id: String(i + 1),
        dayType: p.dayType,
        startHour: String(p.startHour),
        endHour: String(p.endHour),
        price: String(p.price),
      }));
      setPriceRows(
        rows.length > 0
          ? rows
          : [{ id: '1', dayType: 'WEEKDAY', startHour: '8', endHour: '17', price: '150000' }]
      );
    } catch (err: any) {
      setLoadError(err.message || 'Gagal memuat data lapangan');
    }
  };

  const addImageUrl = () => {
    const url = imageInput.trim();
    if (!url) return;
    if (form.imageUrls.includes(url)) {
      setFormError('URL gambar sudah ada');
      return;
    }
    setForm((s) => ({ ...s, imageUrls: [...s.imageUrls, url] }));
    setImageInput('');
  };

  const removeImageUrl = (url: string) => {
    setForm((s) => ({ ...s, imageUrls: s.imageUrls.filter((u) => u !== url) }));
  };

  const addPriceRow = () => {
    const newId = String(priceRows.length + 1);
    setPriceRows((rows) => [
      ...rows,
      { id: newId, dayType: 'WEEKDAY', startHour: '8', endHour: '17', price: '150000' },
    ]);
  };

  const removePriceRow = (id: string) => {
    setPriceRows((rows) => rows.filter((r) => r.id !== id));
  };

  const updatePriceRow = (id: string, field: keyof PriceFormRow, value: any) => {
    setPriceRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const onSubmit = async () => {
    setFormError('');

    const name = form.name.trim();
    const type = form.type.trim();
    const lengthMeter = Number(form.lengthMeter);
    const widthMeter = Number(form.widthMeter);

    if (!name) return setFormError('Nama lapangan wajib diisi');
    if (!type) return setFormError('Tipe lapangan wajib diisi');
    if (!Number.isFinite(lengthMeter) || lengthMeter <= 0)
      return setFormError('Panjang lapangan harus angka > 0');
    if (!Number.isFinite(widthMeter) || widthMeter <= 0)
      return setFormError('Lebar lapangan harus angka > 0');

    // Validate prices
    const prices: FieldPrice[] = [];
    for (const row of priceRows) {
      const start = Number(row.startHour);
      const end = Number(row.endHour);
      const price = Number(row.price);

      if (!Number.isFinite(start) || start < 0 || start > 23)
        return setFormError('Jam mulai harus 0-23');
      if (!Number.isFinite(end) || end < 0 || end > 23)
        return setFormError('Jam selesai harus 0-23');
      if (start >= end) return setFormError('Jam mulai harus < jam selesai');
      if (!Number.isFinite(price) || price <= 0) return setFormError('Harga harus angka > 0');

      prices.push({
        dayType: row.dayType,
        startHour: start,
        endHour: end,
        price,
      });
    }

    if (prices.length === 0) {
      return setFormError('Minimal 1 harga harus diisi');
    }

    const payload = {
      venueId: form.venueId,
      name,
      type,
      isActive: form.isActive,
      lengthMeter,
      widthMeter,
      imageUrls: form.imageUrls.length > 0 ? form.imageUrls : [defaultImage],
      prices,
    };

    try {
      await updateField(fieldId, payload);
      router.push(`/admin/fields/${fieldId}`);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data');
    }
  };

  if (loadError) {
    return (
      <DashboardLayout title="Edit Lapangan" breadcrumb={['Admin', 'Kelola Lapangan', 'Edit']}>
        <Card className="bg-red-50 border-red-200">
          <Text variant="body" className="text-red-700">
            {loadError}
          </Text>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/fields')}>
            Kembali
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Lapangan" breadcrumb={['Admin', 'Kelola Lapangan', 'Edit']}>
      <div className="space-y-6">
        {/* Header */}
        <Button variant="outline" onClick={() => router.push(`/admin/fields/${fieldId}`)}>
          <ArrowLeft size={18} />
          Batal
        </Button>

        {formError && (
          <Card className="bg-red-50 border-red-200" padding="sm">
            <Text variant="caption" className="text-red-700">
              {formError}
            </Text>
          </Card>
        )}

        {/* Form */}
        <Card>
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <Text variant="h4" className="mb-4 font-bold">
                Informasi Lapangan
              </Text>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  fullWidth
                  label="Nama Lapangan"
                  placeholder="Contoh: Futsal Arena - A"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tipe Lapangan
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.type}
                    onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
                  >
                    <option value="SYNTHETIC">Synthetic</option>
                    <option value="GRASS">Grass</option>
                    <option value="INDOOR">Indoor</option>
                  </select>
                </div>

                <Input
                  fullWidth
                  label="Panjang (meter)"
                  placeholder="48"
                  inputMode="numeric"
                  value={form.lengthMeter}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      lengthMeter: e.target.value.replace(/[^0-9]/g, ''),
                    }))
                  }
                />

                <Input
                  fullWidth
                  label="Lebar (meter)"
                  placeholder="25"
                  inputMode="numeric"
                  value={form.widthMeter}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      widthMeter: e.target.value.replace(/[^0-9]/g, ''),
                    }))
                  }
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <button
                    type="button"
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors text-sm font-medium ${
                      form.isActive
                        ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100'
                        : 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
                    }`}
                    onClick={() => setForm((s) => ({ ...s, isActive: !s.isActive }))}
                  >
                    {form.isActive ? 'Aktif' : 'Tidak aktif'}
                  </button>
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <Text variant="h4" className="mb-4 font-bold">
                Gambar Lapangan
              </Text>

              <div className="flex gap-2 mb-3">
                <Input
                  fullWidth
                  placeholder="https://example.com/image.jpg"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addImageUrl();
                    }
                  }}
                />
                <Button type="button" onClick={addImageUrl}>
                  Tambah
                </Button>
              </div>

              {form.imageUrls.length > 0 && (
                <div className="space-y-2">
                  {form.imageUrls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Text variant="caption" className="flex-1 truncate text-gray-600">
                        {url}
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImageUrl(url)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prices */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Text variant="h4" className="font-bold">
                  Harga Per Jam
                </Text>
                <Button type="button" size="sm" onClick={addPriceRow}>
                  <Plus size={16} />
                  Tambah Harga
                </Button>
              </div>

              <div className="space-y-3">
                {priceRows.map((row) => (
                  <Card key={row.id} className="p-3 bg-gray-50" padding="none">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Hari</label>
                        <select
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          value={row.dayType}
                          onChange={(e) => updatePriceRow(row.id, 'dayType', e.target.value)}
                        >
                          <option value="WEEKDAY">Weekday</option>
                          <option value="WEEKEND">Weekend</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Dari Jam</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          value={row.startHour}
                          onChange={(e) => updatePriceRow(row.id, 'startHour', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Sampai Jam</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          value={row.endHour}
                          onChange={(e) => updatePriceRow(row.id, 'endHour', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Harga (Rp)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          value={row.price}
                          onChange={(e) =>
                            updatePriceRow(
                              row.id,
                              'price',
                              e.target.value.replace(/[^0-9]/g, '')
                            )
                          }
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          fullWidth
                          onClick={() => removePriceRow(row.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => router.push(`/admin/fields/${fieldId}`)}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
