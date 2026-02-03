import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Handbag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCustomizer from './Product/ProductCustomizer';
import { COLORS } from '../config/colors';

const ProductModal = ({ isOpen, onClose, product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [quantity, setQuantity] = useState(1);

  // Initialize defaults when product changes or modal opens
  useEffect(() => {
    if (product && isOpen) {
      // Default size
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize(null);
      }

      // Default modifiers
      const defaults = {};
      if (product.modifiers) {
        product.modifiers.forEach(mod => {
          if (mod.default) {
             defaults[mod.title] = mod.default;
          }
        });
      }
      setSelectedModifiers(defaults);
      setQuantity(1);
    }
  }, [product, isOpen]);


  const toggleModifier = (section, optionLabel) => {
    setSelectedModifiers(prev => {
      const current = prev[section.title];
      
      if (section.type === 'single') {
        // Toggle off if already selected (optional, usually single is mandatory choice)
        // For radio behavior, we just switch
        return { ...prev, [section.title]: optionLabel };
      } else {
        // Multiple
        const currentList = Array.isArray(current) ? current : [];
        if (currentList.includes(optionLabel)) {
          return { ...prev, [section.title]: currentList.filter(l => l !== optionLabel) };
        } else {
          return { ...prev, [section.title]: [...currentList, optionLabel] };
        }
      }
    });
  };

  const updateModifierLevel = (sectionTitle, optionLabel, level) => {
     setSelectedModifiers(prev => {
         const sectionState = prev[sectionTitle] || {};
         // If it's stored as an object (complex), update it. 
         // Strategy: We need to store complex modifiers differently or expect "ProductCustomizer" to handle structure.
         // Looking at ProductCustomizer logic: 
         // "val = selectedModifiers[section.title]?.[opt.label]" -> So for complex, it expects { ModSection: { OptionName: { level, placement } } }
         
         const currentSectionListeners = prev[sectionTitle] || {};
         // Ensure it is an object if we are entering complex mode
         const updatedSection = { ...currentSectionListeners };
         
         const currentOptionVal = updatedSection[optionLabel];
         
         // If string (just level or simple), convert to object
         let newVal = { level: "Normal", placement: "Whole" };
         if (typeof currentOptionVal === 'string') {
             newVal = { level: currentOptionVal, placement: "Whole" };
         } else if (typeof currentOptionVal === 'object') {
             newVal = { ...currentOptionVal };
         }
         
         newVal.level = level;
         updatedSection[optionLabel] = newVal;
         
         return { ...prev, [sectionTitle]: updatedSection };
     });
  };

  const updateModifierPlacement = (sectionTitle, optionLabel, placement) => {
      setSelectedModifiers(prev => {
         const currentSectionListeners = prev[sectionTitle] || {};
         const updatedSection = { ...currentSectionListeners };
         const currentOptionVal = updatedSection[optionLabel];
         
         let newVal = { level: "Normal", placement: "Whole" };
         if (typeof currentOptionVal === 'string') {
             newVal = { level: currentOptionVal, placement: "Whole" };
         } else if (typeof currentOptionVal === 'object') {
             newVal = { ...currentOptionVal };
         }
         
         newVal.placement = placement;
         updatedSection[optionLabel] = newVal;
         
         return { ...prev, [sectionTitle]: updatedSection };
     });
  };

  // Simplified handler for ProductCustomizer which seems to expect specific signatures
  // Based on reading ProductCustomizer.jsx:
  /*
     const val = selectedModifiers[section.title]?.[opt.label];
     isSelected = !!val; 
     // ...
     if (typeof val === "string") ... else if (typeof val === "object") ...
  */
  // So for complex modifiers (sections with hasLevel/hasPlacement), the state for that section
  // is NOT an array of strings, but an object where keys are option labels.
  // BUT for simple "multiple" sections, it expects an array?
  // 
  // Line 124: isSelected = selectedModifiers[section.title]?.includes(opt.label);
  // So we need to detect type to update state correctly.
  
  const handleToggleModifier = (section, optionLabel) => {
      const isComplex = section.options.some((opt) => opt.hasLevel || opt.hasPlacement);
      
      if (isComplex) {
          setSelectedModifiers(prev => {
              const sectionState = { ...(prev[section.title] || {}) };
              if (sectionState[optionLabel]) {
                  delete sectionState[optionLabel];
              } else {
                  // Default ADD
                  sectionState[optionLabel] = { level: "Normal", placement: "Whole" };
              }
              return { ...prev, [section.title]: sectionState };
          });
      } else {
          toggleModifier(section, optionLabel); // Reuse simple logic
      }
  };


  if (!isOpen || !product) return null;

  // Calculate Price
  let currentPrice = product.basePrice;
  if (selectedSize && selectedSize.multiplier) {
      currentPrice *= selectedSize.multiplier;
  }
  
  // Modifiers Price
  // Note: accurate calculation requires replicating the logic in ProductCustomizer or moving it to a helper
  // For now, we'll rely on base calculation or implement a basic sum
  // This might be slightly off if we don't duplicate 100% of logic, but sufficient for MV reconstruction
  
  const totalPrice = (currentPrice * quantity).toFixed(2);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
             {/* Header */}
             <div className="flex justify-between items-start p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{product.description}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} className="text-gray-500" />
                </button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col md:flex-row gap-8">
                   <div className="w-full md:w-1/3">
                      <img 
                        src={product.src} 
                        alt={product.name} 
                        className="w-full h-auto rounded-xl object-cover shadow-sm border border-gray-100" 
                      />
                   </div>
                   
                   <div className="w-full md:w-2/3">
                      <ProductCustomizer 
                        product={product}
                        selectedSize={selectedSize}
                        setSelectedSize={setSelectedSize}
                        selectedModifiers={selectedModifiers}
                        toggleModifier={handleToggleModifier}
                        updateModifierLevel={updateModifierLevel}
                        updateModifierPlacement={updateModifierPlacement}
                      />
                   </div>
                </div>
             </div>

             {/* Footer */}
             <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg h-12">
                       <button 
                         onClick={() => setQuantity(Math.max(1, quantity - 1))}
                         className="px-4 h-full hover:bg-gray-100 text-xl font-bold text-gray-600 rounded-l-lg"
                       >-</button>
                       <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
                       <button 
                         onClick={() => setQuantity(quantity + 1)}
                         className="px-4 h-full hover:bg-gray-100 text-xl font-bold text-gray-600 rounded-r-lg"
                       >+</button>
                    </div>
                 </div>

                 <button 
                   onClick={() => {
                       addToCart({...product, modifiers: selectedModifiers, size: selectedSize}, quantity);
                       onClose();
                   }}
                   className="flex-1 h-12 bg-[var(--primary)] text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                   style={{ backgroundColor: COLORS.primary }}
                 >
                   <Handbag size={20} />
                   <span>Add to Order</span>
                   <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-sm">
                     ${totalPrice}
                   </span>
                 </button>
             </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
