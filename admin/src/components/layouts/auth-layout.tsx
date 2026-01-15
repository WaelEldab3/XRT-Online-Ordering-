import { useRouter } from 'next/router';
import Logo from '@/components/ui/logo';
import React from 'react';

export default function AuthPageLayout({
  children,
}: React.PropsWithChildren<{}>) {
  const { locale } = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 px-4 py-8 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-200/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/10 blur-3xl" />
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glassmorphism card */}
        <div
          className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:p-8 md:p-10"
          style={{
            boxShadow:
              '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent opacity-50" />

          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="mb-6 flex justify-center sm:mb-8">
              <div className="transform transition-transform duration-300 hover:scale-105">
                <Logo />
              </div>
            </div>

            {/* Children content */}
            <div className="space-y-6">{children}</div>
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-xs text-gray-500 sm:text-sm">
          Powered by <span className="font-semibold text-gray-700">XRT Tech</span>
        </p>
      </div>
    </div>
  );
}
