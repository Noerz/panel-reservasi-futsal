"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Eye, X } from "lucide-react";
import { Text, Card, Badge, Button } from "@/components/atoms";
import { bookingService, BookingResponse } from "@/services";
import { useAuthStore } from "@/stores";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusVariant(
  status: string
): "success" | "warning" | "error" | "info" {
  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
      return "success";
    case "WAITING_PAYMENT":
    case "WAITING_VERIFICATION":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
      return "error";
    default:
      return "info";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "WAITING_PAYMENT":
      return "Menunggu Pembayaran";
    case "WAITING_VERIFICATION":
      return "Menunggu Verifikasi";
    case "CONFIRMED":
      return "Dikonfirmasi";
    case "REJECTED":
      return "Ditolak";
    case "CANCELLED":
      return "Dibatalkan";
    case "COMPLETED":
      return "Selesai";
    default:
      return status;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function VerificationList() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyModal, setVerifyModal] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadTodayBookings();
  }, []);

  const loadTodayBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getBookings({ today: true });
      setBookings(data);
    } catch (err) {
      console.error("Failed to load today bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openVerifyModal = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setVerifyModal(true);
  };

  const closeVerifyModal = () => {
    setVerifyModal(false);
    setSelectedBooking(null);
  };

  const handleVerify = async (action: "approve" | "reject") => {
    if (!selectedBooking) return;

    const { user } = useAuthStore.getState();
    if (!user) {
      alert("User tidak ditemukan");
      return;
    }

    setVerifying(true);
    try {
      await bookingService.verifyBooking(
        selectedBooking.id,
        action === "approve",
        action === "reject"
          ? "Pembayaran ditolak oleh admin"
          : "Pembayaran diverifikasi"
      );
      await loadTodayBookings();
      closeVerifyModal();
    } catch (err: any) {
      alert(err.message || "Gagal memverifikasi pembayaran");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar size={24} className="text-gray-600" />
        <Text variant="h3">Booking Hari Ini</Text>
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <Text color="muted" className="text-center py-4">
              Memuat data...
            </Text>
          </Card>
        ) : bookings.length === 0 ? (
          <Card>
            <Text color="muted" className="text-center py-8">
              Tidak ada booking hari ini
            </Text>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card
              key={booking.id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Text variant="body" className="font-semibold">
                      {booking.customer?.name || "-"}
                    </Text>
                    <Badge variant={getStatusVariant(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{booking.field?.name || "-"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>
                        {formatTime(booking.startTime)} -{" "}
                        {formatTime(booking.endTime)}
                      </span>
                    </div>
                  </div>

                  {booking.field?.venue?.name && (
                    <Text variant="caption" className="text-gray-500">
                      {booking.field.venue.name}
                    </Text>
                  )}
                </div>

                <div className="text-right space-y-2">
                  <Text variant="body" className="font-bold text-primary">
                    {formatRupiah(booking.totalPrice)}
                  </Text>
                  {booking.customer?.phone && (
                    <Text variant="caption" className="text-gray-500">
                      {booking.customer.phone}
                    </Text>
                  )}
                  {booking.payment?.status === "WAITING_VERIFICATION" &&
                  booking.payment?.proofUrl ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openVerifyModal(booking)}
                    >
                      <Eye size={14} />
                      Verifikasi
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openVerifyModal(booking)}
                    >
                      <Eye size={14} />
                      Detail
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Verify Modal */}
      {verifyModal && selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeVerifyModal}
          />

          <Card
            className="relative w-full max-w-3xl my-8 rounded-2xl shadow-xl"
            padding="lg"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div>
                <Text variant="h3">Detail Pesanan</Text>
                <Text variant="caption" className="text-gray-500">
                  ID: {selectedBooking.id.substring(0, 13)}...
                </Text>
              </div>
              <Button variant="ghost" size="sm" onClick={closeVerifyModal}>
                <X size={20} />
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Info */}
              <div>
                <Text variant="h4" className="font-bold mb-4">
                  Informasi Pesanan
                </Text>
                <div className="space-y-3">
                  <div>
                    <Text variant="caption" className="text-gray-500">
                      Pemesan
                    </Text>
                    <Text variant="body" className="font-medium">
                      {selectedBooking.customer?.name}
                    </Text>
                    {selectedBooking.customer?.email && (
                      <Text variant="caption" className="text-gray-600">
                        {selectedBooking.customer.email}
                      </Text>
                    )}
                    {selectedBooking.customer?.phone && (
                      <Text variant="caption" className="text-gray-600">
                        {selectedBooking.customer.phone}
                      </Text>
                    )}
                  </div>

                  <div>
                    <Text variant="caption" className="text-gray-500">
                      Lapangan
                    </Text>
                    <Text variant="body" className="font-medium">
                      {selectedBooking.field?.name || "-"}
                    </Text>
                    {selectedBooking.field?.venue?.name && (
                      <Text variant="caption" className="text-gray-600">
                        {selectedBooking.field.venue.name}
                      </Text>
                    )}
                  </div>

                  <div>
                    <Text variant="caption" className="text-gray-500">
                      Tanggal
                    </Text>
                    <Text variant="body" className="font-medium">
                      {formatDate(selectedBooking.startTime)}
                    </Text>
                  </div>

                  <div>
                    <Text variant="caption" className="text-gray-500">
                      Waktu
                    </Text>
                    <Text variant="body" className="font-medium">
                      {formatTime(selectedBooking.startTime)} -{" "}
                      {formatTime(selectedBooking.endTime)}
                    </Text>
                  </div>

                  <div className="pt-3 border-t">
                    <Text variant="caption" className="text-gray-500">
                      Total Pembayaran
                    </Text>
                    <Text variant="h3" className="font-bold text-primary">
                      {formatRupiah(selectedBooking.totalPrice)}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              <div>
                <Text variant="h4" className="font-bold mb-4">
                  Bukti Pembayaran
                </Text>

                {selectedBooking.payment?.proofUrl ? (
                  <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={selectedBooking.payment.proofUrl}
                      alt="Bukti Pembayaran"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <Card className="bg-gray-50 h-96 flex items-center justify-center">
                    <Text variant="body" className="text-gray-500">
                      Belum ada bukti pembayaran
                    </Text>
                  </Card>
                )}
              </div>
            </div>

            {/* Actions */}
            {selectedBooking.payment?.status === "WAITING_VERIFICATION" &&
              selectedBooking.payment?.proofUrl && (
                <div className="mt-6 pt-6 border-t flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleVerify("reject")}
                    disabled={verifying}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Tolak
                  </Button>
                  <Button
                    onClick={() => handleVerify("approve")}
                    disabled={verifying}
                  >
                    {verifying ? "Memproses..." : "Terima & Konfirmasi"}
                  </Button>
                </div>
              )}

            {selectedBooking.payment?.status !== "WAITING_VERIFICATION" && (
              <div className="mt-6 pt-6 border-t">
                <Badge
                  variant={getStatusVariant(selectedBooking.status)}
                  className="text-base px-4 py-2"
                >
                  Status: {getStatusLabel(selectedBooking.status)}
                </Badge>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
