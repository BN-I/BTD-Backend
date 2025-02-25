export enum UserRole {
  admin = "Admin",
  vendor = "Vendor",
  user = "User",
}

export enum LoginProvider {
  local = "Local",
  google = "Google",
  facebook = "Facebook",
}

export enum ProductSizes {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
  XXXL = "XXXL",
}

export enum ProductStatus {
  active = "Active",
  inactive = "Inactive",
}

export interface selectedProduct {
  product: string;
  selectedVariations: {
    color: string;
    size: ProductSizes;
  };
}

export interface OrderedProduct {
  product: string;
  selectedVariations: {
    color: string;
    size: ProductSizes;
  };
  price: number;
  vendor: string;
}
