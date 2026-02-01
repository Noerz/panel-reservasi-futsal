"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, TrendingUp, Clock, DollarSign, Calendar, X, FileDown } from "lucide-react";
import { DashboardLayout } from "@/components/templates";
import { Button, Card, Input, Badge, Text } from "@/components/atoms";
import { useAuthStore } from "@/stores";
import { bookingService, BookingResponse, BookingStats } from "@/services";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, initialized, checkAuth } = useAuthStore();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [verifyModal, setVerifyModal] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [initialized, isAuthenticated, router]);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      loadData();
    }
  }, [initialized, isAuthenticated, statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookingsData, statsData] = await Promise.all([
        bookingService.getBookings(
          statusFilter !== "ALL" ? { status: statusFilter } : undefined
        ),
        bookingService.getBookingStats(),
      ]);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.id?.toLowerCase().includes(q) ||
        b.customer?.name?.toLowerCase().includes(q) ||
        b.customer?.email?.toLowerCase().includes(q) ||
        b.field?.name?.toLowerCase().includes(q) ||
        b.field?.venue?.name?.toLowerCase().includes(q)
    );
  }, [bookings, query]);

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
      alert('User tidak ditemukan');
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
      await loadData();
      closeVerifyModal();
    } catch (err: any) {
      alert(err.message || "Gagal memverifikasi pembayaran");
    } finally {
      setVerifying(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Laporan Pesanan Lapangan Futsal", 14, 20);
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 14, 28);
    
    if (statusFilter !== "ALL") {
      doc.text(`Filter Status: ${getStatusLabel(statusFilter)}`, 14, 34);
    }
    
    // Prepare table data
    const tableData = filteredBookings.map((booking) => [
      booking.id.substring(0, 8),
      booking.customer?.name || "-",
      booking.field?.name || "-",
      formatDate(booking.startTime),
      `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`,
      formatRupiah(booking.totalPrice),
      getStatusLabel(booking.status),
    ]);

    // Add table
    autoTable(doc, {
      head: [["ID", "Pemesan", "Lapangan", "Tanggal", "Jadwal", "Total", "Status"]],
      body: tableData,
      startY: statusFilter !== "ALL" ? 40 : 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Add summary
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(10);
    doc.text(`Total Pesanan: ${filteredBookings.length}`, 14, finalY + 10);
    
    if (stats) {
      doc.text(`Booking Aktif: ${stats.activeBookings || 0}`, 14, finalY + 16);
      doc.text(`Menunggu Verifikasi: ${stats.pendingVerification || 0}`, 14, finalY + 22);
      doc.text(`Pendapatan Bulan Ini: ${formatRupiah(stats.monthlyRevenue || 0)}`, 14, finalY + 28);
    }

    // Save PDF
    const fileName = `Laporan_Pesanan_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <DashboardLayout
      title="Kelola Pesanan"
      breadcrumb={["Admin", "Kelola Pesanan"]}
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="w-full md:max-w-md">
              <Input
                fullWidth
                placeholder="Cari ID pesanan, nama user, atau lapangan..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                "ALL",
                "WAITING_PAYMENT",
                "PENDING",
                "PAID",
                "CANCELLED",
                "COMPLETED",
              ].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter === status ? "primary" : "outline"}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "ALL" ? "Semua" : getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Export Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={exportToPDF}
            disabled={isLoading || filteredBookings.length === 0}
          >
            <FileDown size={16} />
            Export ke PDF
          </Button>
        </div>

        {/* Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    ID Pesanan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Lapangan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Jadwal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <Text variant="body" className="text-gray-600">
                        Memuat data...
                      </Text>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <Text variant="body" className="text-gray-600">
                        Tidak ada pesanan
                      </Text>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Text
                          variant="body-sm"
                          className="font-semibold text-primary"
                        >
                          {booking.id.substring(0, 8)}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="body-sm" className="font-medium">
                          {booking.customer?.name || "-"}
                        </Text>
                        
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="body-sm">
                          {booking.field?.name || "-"}
                        </Text>
                        {booking.field?.venue?.name && (
                          <Text variant="caption" className="text-gray-500">
                            {booking.field.venue.name}
                          </Text>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="body-sm">
                          {formatDate(booking.startTime)}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="body-sm">
                          {formatTime(booking.startTime)} -{" "}
                          {formatTime(booking.endTime)}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="body-sm" className="font-semibold">
                          {formatRupiah(booking.totalPrice)}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
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
    </DashboardLayout>
  );
}
