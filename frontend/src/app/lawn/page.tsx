
import CategoryProducts from "@/src/feature/products/components/CategoryProducts";
import { categories } from "@/src/feature/products/data/categories";
export default function LawnPage() {
  return <CategoryProducts config={categories.lawn} />;
}
