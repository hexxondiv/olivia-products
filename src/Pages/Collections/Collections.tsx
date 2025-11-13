// Collections.tsx
import React, { useMemo, useState } from "react";
import { ProductsHolder } from "../Home/ProductsHolder";
import { useLocation } from "react-router-dom";
import "./collection.scss";
import SelectDrop from "../../Components/SelectDrop/SelectDrop";
import PurchaseType from "../../Components/PurchaseType/PurchaseType";
import { useProducts } from "../../ProductsContext";
import { SEO } from "../../Components/SEO/SEO";

export const Collections: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const rawCategory = (params.get("category") || "").trim();
  const categoryLC = rawCategory.toLowerCase();

  const [sortType, setSortType] = useState("price-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [purchaseType, setPurchaseType] = useState<'distribution' | 'wholesale' | 'retail' | null>(null);

  // Get products from context
  const { products: allProductsData } = useProducts();

  // useMemo to avoid recomputing on every render
  const filteredProducts = useMemo(() => {
    if (rawCategory === "" || rawCategory === "*") return allProductsData;
    return allProductsData.filter(p =>
      (p.category || []).some(c => c.toLowerCase() === categoryLC)
    );
  }, [rawCategory, categoryLC, allProductsData]);

  const matchingProduct = useMemo(
    () =>
      allProductsData.find(p =>
        (p.category || []).some(c => c.toLowerCase() === categoryLC)
      ),
    [categoryLC, allProductsData]
  );

  const categoryHeading =
    matchingProduct?.heading ||
    (rawCategory ? `${rawCategory} Collection` : "Shop All");

  const categoryIntro =
    matchingProduct?.detail ||
    "From sparkling dishes to nourished skin, Olivia delivers everyday essentials crafted for a cleaner home, a fresher space, and a more beautiful you.";

  const itemCount = filteredProducts.length;

  return (
    <>
      <SEO
        title={rawCategory ? `${categoryHeading} - Collections` : "Shop All Products - Collections"}
        description={categoryIntro}
        keywords={`${categoryHeading}, ${rawCategory || 'all products'}, Olivia Fresh, ${rawCategory ? rawCategory + ' collection' : 'product collections'}, Nigeria, buy online`}
        url={`/collections${rawCategory ? `?category=${encodeURIComponent(rawCategory)}` : ''}`}
        type="website"
      />
      <div className="col-md-12 collection-section line">
      <h2>{categoryHeading}</h2>

      <p className="col-md-5 animate-charcter lineUp">{categoryIntro}</p>

      <div className="filters-container d-md-flex align-items-center">
        <p style={{ flexGrow: 1 }} className="prd-figure">
          {itemCount} Item{itemCount !== 1 ? "s" : ""}
        </p>

        <div className="filters-wrapper d-flex align-items-center">
          <div
            className="sort-bar search-bar"
          >
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control search-input"
              />
              <span
                className="search-icon"
              >
                🔍
              </span>
            </div>
          </div>

          <div
            className="sort-bar purchase-type-bar"
          >
            <PurchaseType value={purchaseType} onChange={setPurchaseType} />
          </div>

          <div
            className="sort-bar category-bar"
          >
            <SelectDrop />
          </div>

          <div className="sort-bar sort-select-bar">
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="form-select"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      <hr />

      {/* @ts-expect-error - ProductsHolder is a JSX component without TypeScript definitions */}
      <ProductsHolder
        category={rawCategory}
        viewType="grid"
        sortType={sortType}
        searchQuery={searchQuery}
        purchaseType={purchaseType}
      />
    </div>
    </>
  );
};
