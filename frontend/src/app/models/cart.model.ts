import { Product } from './product.model';

export interface CartItem {
  id?: number;
  cartItemId?: number;
  product?: Product;
  productId?: number;
  productName?: string;
  imageUrl?: string;
  brand?: string;
  price?: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id?: number;
  items: CartItem[];
  // Backend uses these field names
  totalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  // Frontend also uses these field names
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  discount?: number;
  total?: number;
  appliedCoupon?: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}