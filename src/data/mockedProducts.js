// src/data/mockProducts.js
import iphone1 from "../assets/products/iphone-1.jpg";
import iphone2 from "../assets/products/iphone-2.jpg";
import iphone3 from "../assets/products/iphone-4.jpg";
import ipad1 from "../assets/products/ipad-1.jpg";
import ipad2 from "../assets/products/ipad-2.jpg";

export const mockProducts = [
    {
        productResponseDto: {
            productId: 1,
            name: "iPhone 15 Pro",
            description:
                "Apple's latest iPhone featuring A17 Pro chip, advanced camera system, and titanium design. Available in multiple colors and capacities.",
            price: 999.0,
            stock: 126,
            storeId: 8,
        },
        catalogResourceUrlSet: [
            { productCatalogId: 3, productImageUrl: iphone1 },
            { productCatalogId: 1, productImageUrl: iphone2 },
            { productCatalogId: 2, productImageUrl: iphone3 }
        ],
    },
    {
        productResponseDto: {
            productId: 2,
            name: "iPad Pro 12.9-inch",
            description:
                "High-performance iPad Pro with M2 chip, stunning display, and Apple Pencil support for creative professionals.",
            price: 1099.0,
            stock: 22,
            storeId: 8,
        },
        catalogResourceUrlSet: [
            { productCatalogId: 4, productImageUrl: ipad1 },
            { productCatalogId: 5, productImageUrl: ipad2 }
        ],
    },
];
