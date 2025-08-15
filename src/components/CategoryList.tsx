import React from "react";
import Link from "next/link";

interface CategoryListProps {
  categories: string[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link
          href={`/categories/${category}`}
          key={category}
          className="rounded-full px-3 py-1 text-sm bg-category-1 text-category-1 hover:bg-category-2 transition-colors"
        >
          {category}
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;
