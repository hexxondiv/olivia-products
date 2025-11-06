// Collections.tsx
import React, { useMemo, useState } from "react";
import { ProductsHolder } from "../Home/ProductsHolder";
import { useLocation } from "react-router-dom";
import "./collection.scss";
import SelectDrop from "../../Components/SelectDrop/SelectDrop";
import PurchaseType from "../../Components/PurchaseType/PurchaseType";
import { allProductsData } from "../../TestData/allProductsData";

export const Collections: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const rawCategory = (params.get("category") || "").trim();
  const categoryLC = rawCategory.toLowerCase();

  const [sortType, setSortType] = useState("price-asc");

  // useMemo to avoid recomputing on every render
  const filteredProducts = useMemo(() => {
    if (rawCategory === "" || rawCategory === "*") return allProductsData;
    return allProductsData.filter(p =>
      (p.category || []).some(c => c.toLowerCase() === categoryLC)
    );
  }, [rawCategory, categoryLC]);

  const matchingProduct = useMemo(
    () =>
      allProductsData.find(p =>
        (p.category || []).some(c => c.toLowerCase() === categoryLC)
      ),
    [categoryLC]
  );

  const categoryHeading =
    matchingProduct?.heading ||
    (rawCategory ? `${rawCategory} Collection` : "Shop All");

  const categoryIntro =
    matchingProduct?.detail ||
    "From sparkling dishes to nourished skin, Olivia delivers everyday essentials crafted for a cleaner home, a fresher space, and a more beautiful you.";

  const itemCount = filteredProducts.length;

  return (
    <div className="collection-section">
      <h2>{categoryHeading}</h2>

      <p className="collection-intro animate-charcter lineUp">{categoryIntro}</p>

      <div className="collection-header">
        <p className="prd-figure">
          {itemCount} Item{itemCount !== 1 ? "s" : ""}
        </p>

        <div className="sort-controls">
          <div className="sort-bar">
            <PurchaseType />
          </div>

          <div className="sort-bar">
            <SelectDrop />
          </div>

          <div className="sort-bar">
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

      <ProductsHolder
        category={rawCategory}
        viewType="grid"
        sortType={sortType}
      />
    </div>
  );
};
