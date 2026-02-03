import React from 'react';
import { useParams } from 'react-router-dom';
import { products } from '../config/constants';

const ProductDetails = () => {
  const { id } = useParams();
  
  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-500">Product not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
            <img 
            src={product.src} 
            alt={product.name} 
            className="w-full max-h-[500px] object-contain"
            />
        </div>

        {/* Details */}
        <div>
           <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
             {product.category}
           </span>
           <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">{product.name}</h1>
           <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
           
           <div className="text-2xl font-bold text-green-700 mb-6">
             ${product.basePrice}
           </div>

           <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
             Add to Cart
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
