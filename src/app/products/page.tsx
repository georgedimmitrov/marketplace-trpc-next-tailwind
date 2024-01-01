import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import ProductReel from "@/components/products/ProductReel";
import { PRODUCT_CATEGORIES } from "@/config";
import React from "react";

type Param = string | string[] | undefined;

interface ProductsPageProps {
  searchParams: { [key: string]: Param };
}

const parseParam = (param: Param) => {
  return typeof param === "string" ? param : undefined;
};

const ProductsPage = ({ searchParams }: ProductsPageProps) => {
  const sort = parseParam(searchParams.sort);
  const category = parseParam(searchParams.category);
  const productLabel = PRODUCT_CATEGORIES.find(
    ({ value }) => value === category
  )?.label;

  return (
    <MaxWidthWrapper>
      <ProductReel
        title={productLabel ?? "Browse high-quality assets"}
        query={{
          category,
          limit: 40,
          sort: sort === "desc" || sort === "asc" ? sort : undefined,
        }}
      />
    </MaxWidthWrapper>
  );
};

export default ProductsPage;
