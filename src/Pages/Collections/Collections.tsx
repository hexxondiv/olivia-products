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
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="col-md-12 collection-section line">
      <h2>{categoryHeading}</h2>

      <p className="col-md-5 animate-charcter lineUp">{categoryIntro}</p>

      <div className="d-md-flex align-items-center">
        <p style={{ flexGrow: 1 }} className="prd-figure">
          {itemCount} Item{itemCount !== 1 ? "s" : ""}
        </p>

        <div className="d-flex align-items-center">
          <div
            className="sort-bar col-md-"
            style={{
              borderRight: "solid 1px #e7e7e7",
              marginRight: "10px",
              paddingRight: "10px",
            }}
          >
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{
                  paddingLeft: "35px",
                  minWidth: "200px",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                }}
              >
                🔍
              </span>
            </div>
          </div>

          <div
            className="sort-bar col-md-"
            style={{
              borderRight: "solid 1px #e7e7e7",
              marginRight: "10px",
            }}
          >
            <PurchaseType />
          </div>

          <div
            className="sort-bar col-md-"
            style={{
              borderRight: "solid 1px #e7e7e7",
              marginRight: "10px",
            }}
          >
            <SelectDrop />
          </div>
        </div>

        <div className="sort-bar col-md-2">
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

      <hr />

      <ProductsHolder
        category={rawCategory}
        viewType="grid"
        sortType={sortType}
        searchQuery={searchQuery}
      />
    </div>
  );
};
