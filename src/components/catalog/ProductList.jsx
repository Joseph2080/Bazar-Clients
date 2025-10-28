// src/components/catalog/ProductList.jsx
import ProductCard from "./ProductCard";

export default function ProductList({ products, onSelect }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
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