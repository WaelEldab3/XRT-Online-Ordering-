import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { COLORS } from '../config/colors';
import { CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || '';

  return (
    <div
      className="min-h-screen pt-32 pb-20 px-4"
      style={{ '--primary': COLORS.primary, '--text-primary': COLORS.textPrimary }}
    >
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle size={48} className="text-[var(--primary)]" />
        </div>

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Order Placed!
        </h1>

        {orderNumber && (
          <p className="text-lg text-gray-600 mb-2">
            Order <span className="font-bold text-[var(--primary)]">#{orderNumber}</span>
          </p>
        )}

        <p className="text-gray-500 mb-8 text-center px-6 max-w-md">
          Thank you for your order! We've received it and are preparing it now.
          You'll be notified when it's ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/menu"
            className="px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-full hover:brightness-110 transition-all shadow-lg shadow-green-200 flex items-center gap-2"
          >
            <ShoppingBag size={18} />
            Order More
          </Link>
          <Link
            to="/"
            className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
