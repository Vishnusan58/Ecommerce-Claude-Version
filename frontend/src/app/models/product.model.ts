export interface Product {
  // Backend returns 'id' from entity or 'productId' from DTO
  id?: number;
  productId?: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl: string;
  images?: string[];
  category?: Category;
  brand?: string;
  // Backend returns 'stockQuantity'
  stock?: number;
  stockQuantity?: number;
  // Backend returns 'averageRating'
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  sellerId?: number;
  seller?: { id: number; name: string };
  sellerName?: string;
  premiumEarlyAccess?: boolean;
  earlyAccessDate?: Date;
  createdAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface ProductFilter {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  search?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}