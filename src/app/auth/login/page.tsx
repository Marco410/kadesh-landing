"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Tabs, Tab } from '@heroui/tabs';
import Logo from 'kadesh/components/shared/Logo';
import { useLogin, useRegister } from '../../../components/auth/hooks';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || null;
  const initialTab = searchParams.get('tab') || 'login';
  
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    email: loginEmail,
    setEmail: setLoginEmail,
    password: loginPassword,
    setPassword: setLoginPassword,
    error: loginError,
    loading: loginLoading,
    handleSubmit: handleLogin,
  } = useLogin({ redirectTo: redirectPath });

  const {
    name: registerName,
    setName: setRegisterName,
    lastName: registerLastName,
    setLastName: setRegisterLastName,
    email: registerEmail,
    setEmail: setRegisterEmail,
    phone: registerPhone,
    setPhone: setRegisterPhone,
    password: registerPassword,
    setPassword: setRegisterPassword,
    confirmPassword: registerConfirmPassword,
    setConfirmPassword: setRegisterConfirmPassword,
    error: registerError,
    loading: registerLoading,
    handleSubmit: handleRegister,
  } = useRegister({
    onSuccess: () => {
      if (redirectPath) {
        // If there's a redirect, automatically login and redirect
        setSuccessMessage('Registro exitoso. Iniciando sesión...');
        // Auto-login will be handled by useRegister
      } else {
        // Switch to login tab after successful registration
        setSelectedTab('login');
        // Show success message
        setSuccessMessage('Registro exitoso, ya puedes iniciar sesión con tus credenciales');
      }
    },
    redirectTo: redirectPath,
  });

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login clicked');
  };

  return (
    <div className="min-h-screen flex bg-[#f5f5f5] dark:bg-[#0a0a0a] relative">
      {/* Background Image - Mobile: full screen with blur, Desktop: left side */}
      <div className="lg:hidden fixed inset-0 w-full h-full z-0">
        <Image
          src="/conectando.png"
          alt="KADESH - Conectando vidas, rescatando almas"
          fill
          className="object-cover blur-xs"
          priority
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Left side - Image (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/conectando.png"
          alt="KADESH - Conectando vidas, rescatando almas"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Logo size={72} />
          </div>

          {/* Card Container */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-lg dark:shadow-2xl p-6 sm:p-8 border border-[#e0e0e0] dark:border-[#3a3a3a]">
            {/* Tabs */}
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => {
                setSelectedTab(key as string);
                setSuccessMessage('');
              }}
              className="w-full"
              classNames={{
                tabList: "w-full bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg p-1",
                tab: "flex-1 text-sm font-semibold data-[selected=true]:bg-white dark:data-[selected=true]:bg-[#1e1e1e] data-[selected=true]:text-orange-500 dark:data-[selected=true]:text-orange-400",
                tabContent: "text-[#616161] dark:text-[#b0b0b0]",
                panel: "mt-6",
              }}
            >
            <Tab key="login" title="Iniciar Sesión">
              <form onSubmit={(e) => {
                setSuccessMessage('');
                handleLogin(e, loginEmail, loginPassword);
              }} className="space-y-5">
                {successMessage && (
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm font-medium">
                    {successMessage}
                  </div>
                )}
                {loginError && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
                    {loginError}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="login-email" className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="tu@kadesh.com.mx"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-password" className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold text-base h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-orange-500 dark:disabled:hover:bg-orange-500"
                >
                  {loginLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>

                {/* <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e0e0e0] dark:border-[#3a3a3a]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#ffffff] dark:bg-[#121212] text-[#616161] dark:text-[#b0b0b0]">
                      O continúa con
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full border-2 border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] font-semibold text-base h-12 rounded-xl hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] hover:border-[#d0d0d0] dark:hover:border-[#4a4a4a] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar con Google
                </button> */}
              </form>
            </Tab>

            <Tab key="register" title="Registrarse">
              <form onSubmit={handleRegister} className="space-y-5">
                {registerError && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
                    {registerError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="register-name" className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="register-name"
                      type="text"
                      placeholder="Juan"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-lastname" className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]">
                      Apellido paterno <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="register-lastname"
                      type="text"
                      placeholder="Pérez"
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="register-email" className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    placeholder="tu@kadesh.com.mx"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="register-phone" className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]">
                    Teléfono
                  </label>
                  <input
                    id="register-phone"
                    type="tel"
                    placeholder="+52 55 1234 5678 (opcional)"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="register-password" className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-confirm-password" className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]">
                      Confirmar contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="register-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold text-base h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-orange-500 dark:disabled:hover:bg-orange-500"
                >
                  {registerLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Registrando...</span>
                    </>
                  ) : (
                    'Registrarse'
                  )}
                </button>

                {/* <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e0e0e0] dark:border-[#3a3a3a]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3  text-[#616161] dark:text-[#b0b0b0] font-medium">
                      O continúa con
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full border-2 border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] font-semibold text-base h-12 rounded-xl hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] hover:border-[#d0d0d0] dark:hover:border-[#4a4a4a] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar con Google
                </button> */}
              </form>
            </Tab>
          </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

