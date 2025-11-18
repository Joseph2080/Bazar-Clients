// src/components/catalog/ProductList.jsx
import ProductCard from "./ProductCard";

export default function ProductList({ products, onSelect }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
                <ProductCard
                    key={product.productResponseDto.productId}
                    product={product}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}