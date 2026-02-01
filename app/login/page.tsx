"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Volleyball,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";
import { useAuthStore } from "@/stores";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated, initialized, checkAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.replace('/admin');
    }
  }, [initialized, isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!email || !password) {
      setValidationError("Email dan password harus diisi");
      return;
    }

    if (!email.includes("@")) {
      setValidationError("Format email tidak valid");
      return;
    }

    try {
      await login(email, password);
      // Token sudah disimpan di cookies oleh authStore
      router.push("/admin");
    } catch (e) {
      // Error handled by store, tidak perlu alert lagi
      console.error('Login error:', e);
    }
  };

  const features = [
    {
      icon: Calendar,
      title: "Kelola Jadwal",
      desc: "Atur jadwal lapangan dengan mudah",
    },
    { icon: Clock, title: "Real-time", desc: "Monitoring reservasi langsung" },
    {
      icon: DollarSign,
      title: "Laporan Keuangan",
      desc: "Otomatis terintegrasi",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-primary relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center w-full p-12 xl:p-16">
          <div className="max-w-lg">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
              <Volleyball size={40} className="text-white" />
            </div>

            {/* Title */}
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
              Mini Soccer Venue
            </h1>
            <p className="text-lg text-white/80 mb-10">
              Platform terpadu untuk mengelola reservasi lapangan futsal dan
              mini soccer
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10"
                >
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/70">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-primary px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Volleyball size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                Mini Soccer Venue
              </h1>
              <p className="text-sm text-white/80">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
                <Volleyball size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h2>
              <p className="text-gray-500 mt-1">Mini Soccer Venue Management</p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              {/* Card Header */}
              <div className="text-center lg:text-left mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  Selamat Datang 👋
                </h3>
                <p className="text-gray-500">Silakan masuk ke akun Anda</p>
              </div>

              {/* Demo Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Demo Account
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Email:</span>
                    <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-800">
                      admin@example.com
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Password:</span>
                    <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-800">
                      admin123
                    </code>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {/* {(error || validationError) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Gagal masuk</p>
                    <p className="text-sm text-red-600">{error || validationError}</p>
                  </div>
                </div>
              )} */}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email"
                      disabled={isLoading}
                      className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      disabled={isLoading}
                      className="w-full h-12 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    "Masuk ke Dashboard"
                  )}
                </button>
              </form>

              {/* Help Link */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Lupa password?{" "}
                <a
                  href="#"
                  className="text-primary font-medium hover:underline"
                >
                  Hubungi admin
                </a>
              </p>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-6">
              © 2026 Mini Soccer Venue. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
