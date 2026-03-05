import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { COLORS } from '../config/colors';
import { ArrowLeft, Plus, Minus, ShoppingBag, Ticket, Trash2, MapPin, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { restaurantLocation } from '@/constants/business';

const TAX_RATE = 0.1; // 10% mock tax
const TIP_OPTIONS = [10, 15, 20, 25];

const Checkout = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, orderType: contextOrderType, deliveryDetails, setShowDeliveryModal } = useCart();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState(contextOrderType || 'delivery');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) setPromoApplied(true);
  };

  // Price helper
  const getPriceValue = (priceStr) => {
    if (!priceStr) return 0;
    return parseFloat(String(priceStr).replace(/[^0-9.]/g, '')) || 0;
  };

  const subtotal = cartTotal;
  const tax = subtotal * TAX_RATE;
  const tipAmount = customTip
    ? Number(customTip) || 0
    : selectedTip
      ? subtotal * (selectedTip / 100)
      : 0;
  const total = subtotal + tax + tipAmount;

  // Build delivery address string
  const deliveryAddress = deliveryDetails
    ? [deliveryDetails.address1, deliveryDetails.apt, deliveryDetails.city, deliveryDetails.state, deliveryDetails.zipcode]
        .filter(Boolean)
        .join(', ')
    : '';

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div
        className="min-h-screen pt-32 pb-20 px-4"
        style={{ '--primary': COLORS.primary, '--text-primary': COLORS.textPrimary }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
            <ShoppingBag size={36} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-center px-6">
            Add some items to your cart before checking out.
          </p>
          <Link
            to="/menu"
            className="px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-full hover:brightness-110 transition-all shadow-lg shadow-green-200 flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 md:px-8"
      style={{ '--primary': COLORS.primary, '--text-primary': COLORS.textPrimary }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Back to Cart */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--primary)] font-medium mb-6 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Cart
        </Link>

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-1">Checkout</h1>
          <p className="text-gray-500 text-lg">
            Finish your {orderType === 'delivery' ? 'delivery' : 'pickup'} order
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* ── LEFT COLUMN: Form ── */}
          <div className="lg:col-span-3 space-y-8">
            {/* Contact Information */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white text-sm font-bold flex items-center justify-center">1</span>
                Contact Information
              </h2>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Order Type</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                      orderType === 'delivery'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Delivery
                  </button>
                  <button
                    onClick={() => setOrderType('pickup')}
                    className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                      orderType === 'pickup'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Pick Up
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-100 rounded-lg flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Location ({orderType === 'delivery' ? 'Delivery' : 'Pick Up'})
                  </p>
                  <p className="text-sm text-gray-600">
                    {orderType === 'delivery'
                      ? deliveryAddress
                      : restaurantLocation
                    }
                  </p>
                </div>

                {orderType === 'delivery' && (
                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    className="text-green-600 text-sm font-medium hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
            </section>

            {/* Promo Code */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white text-sm font-bold flex items-center justify-center">2</span>
                Promo Code
              </h2>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Ticket size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (promoApplied) setPromoApplied(false);
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  disabled={!promoCode.trim()}
                  className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="mt-3 text-sm text-green-600 font-medium flex items-center gap-1">
                  <Ticket size={14} />
                  Promo code applied!
                </p>
              )}
            </section>
          </div>

          {/* ── RIGHT COLUMN: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-28">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-[var(--primary)]" />
                Your Bag
                <span className="ml-auto text-sm font-medium text-gray-400">
                  {cartItems.reduce((s, i) => s + i.qty, 0)} items
                </span>
              </h2>



              {/* Cart Items */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {cartItems.map((item) => {
                  const unitPrice = getPriceValue(item.price);
                  const lineTotal = unitPrice * item.qty;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 items-start group p-3 rounded-xl hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 p-1.5 flex-shrink-0 overflow-hidden">
                        <img
                          src={item.src}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">£{unitPrice.toFixed(2)} each</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-1 py-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 hover:bg-white rounded-md transition-colors text-gray-500 hover:text-[var(--primary)]"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-semibold text-gray-900 w-5 text-center text-xs">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 hover:bg-white rounded-md transition-colors text-gray-500 hover:text-[var(--primary)]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <span className="font-bold text-[var(--primary)] text-sm whitespace-nowrap mt-1">
                        £{lineTotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Tip Section */}
              <div className="mt-5 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Heart size={14} className="text-[var(--primary)]" />
                  Add a Tip
                </p>
                <div className="flex flex-wrap gap-2">
                  {TIP_OPTIONS.map((pct) => (
                    <button
                      key={pct}
                      onClick={() => {
                        setSelectedTip(selectedTip === pct ? null : pct);
                        setCustomTip('');
                      }}
                      className={`px-3.5 py-2 text-sm font-semibold rounded-lg border transition-all ${
                        selectedTip === pct && !customTip
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[var(--primary)] hover:text-[var(--primary)]'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <input
                    type="number"
                    min="0"
                    placeholder="Custom"
                    value={customTip}
                    onChange={(e) => {
                      setCustomTip(e.target.value);
                      if (e.target.value) setSelectedTip(null);
                    }}
                    className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                  />
                </div>
                {tipAmount > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Tip: £{tipAmount.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-5" />

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span className="font-semibold">£{tax.toFixed(2)}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tip</span>
                    <span className="font-semibold text-[var(--primary)]">£{tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-[var(--text-primary)]">Total</span>
                  <span className="text-2xl font-bold text-[var(--primary)]">£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                className="w-full mt-6 py-4 bg-[var(--primary)] hover:brightness-110 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-green-200 hover:shadow-green-300 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Pay £{total.toFixed(2)}
              </button>

              {/* Secure notice */}
              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Secure checkout · SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
