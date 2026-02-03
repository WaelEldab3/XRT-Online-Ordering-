import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, User, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCart } from '../../../context/CartContext';
import { COLORS } from '../../../config/colors';

const DeliveryDetailsModal = () => {
  const { 
    showDeliveryModal, 
    setShowDeliveryModal, 
    setDeliveryDetails, 
    setOrderType,
    deliveryDetails 
  } = useCart();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    if (deliveryDetails) {
      setValue('firstName', deliveryDetails.firstName);
      setValue('lastName', deliveryDetails.lastName);
      setValue('address', deliveryDetails.address);
    }
  }, [deliveryDetails, setValue]);

  const onSubmit = (data) => {
    setDeliveryDetails(data);
    setOrderType('delivery');
    setShowDeliveryModal(false);
  };

  const handleClose = () => {
    setShowDeliveryModal(false);
    // If closing without saving and no order type logic, might want to handle it (optional)
  };

  return (
    <AnimatePresence>
      {showDeliveryModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: COLORS.primary }}>
                <MapPin className="text-blue-500" size={24} />
                Delivery Details
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <User size={14} className="text-gray-400" />
                    First Name
                  </label>
                  <input
                    {...register("firstName", { required: "First name is required" })}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-100 bg-gray-50/50 outline-none transition-all ${
                      errors.firstName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <User size={14} className="text-gray-400" />
                    Last Name
                  </label>
                  <input
                    {...register("lastName", { required: "Last name is required" })}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-100 bg-gray-50/50 outline-none transition-all ${
                      errors.lastName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  Delivery Address
                </label>
                <textarea
                  {...register("address", { required: "Address is required" })}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-100 bg-gray-50/50 outline-none transition-all min-h-[100px] resize-none ${
                    errors.address ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="Enter your full delivery address..."
                ></textarea>
                {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save & Continue
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeliveryDetailsModal;
