import React from "react";
import CatCard from "./CatCard";
import { useCategoriesQuery } from "@/api";
import CategorySkeleton from "./CategorySkeleton";

export default function Categories({ categories: propCategories }) {
  const { categories: fetchedCategories, loading } = useCategoriesQuery();
  
  const categories = propCategories || fetchedCategories;

  if (loading && !propCategories) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {[...Array(8)].map((_, i) => (
          <CategorySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <>
      <div className="gap-y-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 py-[45px] px-[38px]  pb-[10px] place-items-center">
        {categories.map((item, i) => {
          return <CatCard key={item._id || i} item={item} index={i} />;
        })}
      </div>
    </>
  );
}
