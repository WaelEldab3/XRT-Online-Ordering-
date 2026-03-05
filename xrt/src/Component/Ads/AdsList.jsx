import React from "react";
import { cards_items } from "../../config/constants";
import AdsCard from "./AdsCard";

export default function AdsList() {
  return (
    <div className="px-6 lg:px-12 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 place-items-center max-w-[1260px] mx-auto">
        {cards_items.map((item, i) => (
          <div key={i} className="w-[360px] lg:w-[410px] xl:w-[400px]">
            <AdsCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
