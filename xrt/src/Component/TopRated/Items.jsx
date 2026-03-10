import React from 'react'
import { COLORS } from '../../config/colors';

export default function Items({item}) {
  const styleVars = {
    '--primary': COLORS.primary,
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-center md:items-start" style={styleVars}>
          <img
            src={item.src}
            alt=""
            className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-[10px] cursor-pointer object-cover"
          />
          <div className="mt-3 md:mt-0 md:pl-[15px] w-full md:w-[220px] flex flex-col text-center md:text-left">
            <span className="block text-[18px] hover:cursor-pointer hover:text-[var(--primary)] duration-300">
              {item.name}
            </span>
            <div className="">
              <span className="line-through text-gray-500 text-[15px] ">
                {item.basePrice ? `$${item.basePrice.toFixed(2)}` : item.price}
              </span>
              <span className="pl-3 text-[var(--primary)] font-semibold text-[18px]">
                {item.offer}
              </span>
            </div>
          </div>
        </div>
    </>
  )
}
