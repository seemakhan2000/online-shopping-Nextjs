
import CategoryProducts from "@/src/feature/products/components/CategoryProducts";
import { categories } from "@/src/feature/products/data/categories";

export default function BestSellersPage() {
  return (
    <CategoryProducts
      config={{
        ...categories.bestSellers,
        discount: "30% OFF",
      }}
    />
  );
}
